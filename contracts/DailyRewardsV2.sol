// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice Interface for DailyGM contract
interface IDailyGM {
    function lastGMDay(address user) external view returns (uint256);
}

/// @author OnePulse Team
/// @title Daily Rewards Contract V2
/// @dev Contract for managing daily token rewards for Farcaster FIDs with backend-signed authorizations.
/// @notice Uses personal_sign for universal wallet compatibility (EOA, smart wallets, passkeys, etc.)
/// @notice Features manageable signer, reward token, and daily claim limits
contract DailyRewardsV2 is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    uint256 private constant MAX_DEADLINE_WINDOW = 5 minutes; // Max signature validity window
    uint256 private constant MAX_BATCH_SIZE = 100; // Max FIDs per batch update to prevent gas limit DoS
    uint256 private constant SECONDS_PER_DAY = 1 days;

    /// @notice Address authorized to sign claim authorizations.
    address public backendSigner;
    /// @notice ERC20 token used for rewards.
    IERC20 public rewardToken;
    /// @notice Minimum reward token balance to maintain in the vault as reserve.
    uint256 public minVaultBalance = 100e18; // 100 tokens default
    /// @notice Daily reward amount per claim in reward tokens.
    uint256 public claimRewardAmount = 5e18; // 5 tokens default
    /// @notice Global daily claim limit (maximum claims per day across all users).
    uint256 public dailyClaimLimit = 250; // 250 claims per day by default
    /// @notice Address of the DailyGM contract to check GM status.
    address public dailyGMContract;
    // Cache for address(this) to save gas on repeated usage
    address private immutable _self;

    // Storage
    struct UserInfo {
        uint48 lastClaimDay; // last claim day number (block.timestamp / 1 days)
        uint48 reserved1; // Reserved for future use
        uint160 reserved2; // Reserved for future use (completes the 256-bit slot)
    }
    struct FidInfo {
        bool blacklisted; // whether FID is blacklisted (1 byte)
        uint48 blacklistedSince; // day when blacklisted (0 if not blacklisted)
        uint48 reserved1; // Reserved for future use
        uint160 reserved2; // Reserved for future use (completes the 256-bit slot)
    }
    struct ClaimStatus {
        bool ok;
        bool fidIsBlacklisted;
        bool fidClaimedToday;
        bool globalLimitReached;
        bool hasSentGMToday;
        uint256 reward;
        uint256 vaultBalance;
        uint256 minReserve;
        uint256 globalClaimsToday;
        uint256 globalClaimLimit;
    }

    /// @notice Mapping of FID to their blacklist status and information.
    /// @dev Maps Farcaster FID to FidInfo struct containing blacklist status
    mapping(uint256 => FidInfo) public fidInfo;

    /// @notice Mapping of claimer addresses to their claim information (last claim day).
    /// @dev Maps user address to UserInfo struct containing last claim day
    mapping(address => UserInfo) public userInfo;

    /// @notice Mapping tracking which FIDs have claimed on each specific day (key = keccak256(abi.encode(fid, day))).
    /// @dev Uses keccak256(abi.encode(fid, day)) as key to track daily claims per FID
    mapping(bytes32 => bool) public claimedByDay;

    /// @notice Mapping tracking global claim count per day (key = day number).
    /// @dev Maps day number (block.timestamp / 1 days) to claim count for that day
    mapping(uint256 => uint256) public dailyClaimCount;

    /// @notice Mapping to track used signatures to prevent replay attacks.
    /// @dev Stores signature bytes as key to prevent signature reuse across claims
    mapping(bytes => bool) public usedSignatures;

    /// @notice Mapping of claimer addresses to their current nonce for signature validation.
    /// @dev Nonce system for additional front-running protection. Users can increment their nonce to invalidate old signatures.
    mapping(address => uint256) public nonces;

    // Events
    /// @dev Emitted when a user successfully claims their daily reward
    event Claimed(
        address indexed recipient,
        uint256 indexed fid,
        uint256 amount
    );
    /// @dev Emitted when FID blacklist status is updated
    event BlacklistUpdated(uint256[] fids, bool indexed isBlacklisted);
    /// @dev Emitted when minimum vault balance is changed
    event MinVaultBalanceUpdated(uint256 oldValue, uint256 newValue);
    /// @dev Emitted when daily claim reward amount is changed
    event ClaimRewardAmountUpdated(uint256 oldValue, uint256 newValue);
    /// @dev Emitted when global daily claim limit is changed
    event DailyClaimLimitUpdated(uint256 oldValue, uint256 newValue);
    /// @dev Emitted when global daily claim limit is reached
    event DailyClaimLimitReached(uint256 day, uint256 claimCount);
    /// @dev Emitted when backend signer is changed
    event BackendSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );
    /// @dev Emitted when reward token is changed
    event RewardTokenUpdated(
        address indexed oldToken,
        address indexed newToken
    );
    /// @dev Emitted when DailyGM contract address is updated
    event DailyGMContractUpdated(
        address indexed oldContract,
        address indexed newContract
    );

    // Custom errors
    error ZeroAddress();
    error InvalidFID();
    error ZeroAmount();
    error SignatureExpired();
    error DeadlineTooLong();
    error SignatureAlreadyUsed();
    error InvalidSignature();
    error FIDBlacklisted();
    error MustGMToday();
    error AlreadyClaimedFIDToday();
    error GlobalDailyClaimLimitExceeded();
    error InsufficientVaultBalance();
    error BatchTooLarge();
    error BelowMinimumReserve();
    error SameValue();

    /// @notice Initializes the contract with backend signer, reward token, and DailyGM contract.
    /// @dev Initializes the contract with required parameters.
    /// @param _backendSigner Address authorized to sign claim authorizations
    /// @param _rewardToken ERC20 token to use for rewards
    /// @param _dailyGMContract Address of the DailyGM contract for GM verification (can be zero address)
    constructor(
        address _backendSigner,
        address _rewardToken,
        address _dailyGMContract
    ) payable Ownable(msg.sender) {
        if (_backendSigner == address(0)) revert ZeroAddress();
        if (_rewardToken == address(0)) revert ZeroAddress();
        if (_dailyGMContract == address(0)) revert ZeroAddress();
        _self = address(this);
        backendSigner = _backendSigner;
        rewardToken = IERC20(_rewardToken);
        dailyGMContract = _dailyGMContract;
    }

    /// @dev Allows anyone to claim daily rewards with a backend-signed authorization.
    /// @notice Claims daily rewards using a backend-signed authorization. Works with any wallet type.
    /// @param claimer The address that will receive the reward tokens
    /// @param fid The Farcaster FID associated with this claim
    /// @param nonce The nonce for this claim (must match claimer's current nonce)
    /// @param deadline The timestamp when this signature expires (max 5 minutes from creation)
    /// @param signature The backend-signed authorization signature
    function claim(
        address claimer,
        uint256 fid,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        // Input validation
        if (claimer == address(0)) revert ZeroAddress();
        if (fid == 0) revert InvalidFID();
        if (nonce != nonces[claimer]) revert InvalidSignature(); // Nonce must match

        // Cache block.timestamp to save gas
        uint256 timestamp = block.timestamp;
        if (timestamp > deadline) revert SignatureExpired();

        unchecked {
            // Safe: deadline - timestamp cannot underflow due to check above
            if (deadline - timestamp > MAX_DEADLINE_WINDOW)
                revert DeadlineTooLong();
        }

        // Replay protection
        if (usedSignatures[signature]) revert SignatureAlreadyUsed();

        // Signature verification - backend signs message with nonce
        bytes32 messageHash = keccak256(
            abi.encodePacked(claimer, fid, nonce, deadline, _self)
        );

        // Add Ethereum Signed Message prefix and recover signer
        // Using OpenZeppelin's ECDSA library to prevent signature malleability attacks
        address signer = MessageHashUtils
            .toEthSignedMessageHash(messageHash)
            .recover(signature);

        if (signer != backendSigner) revert InvalidSignature();

        // Validate eligibility (inlined and optimized)
        uint48 currentDay = uint48(timestamp / SECONDS_PER_DAY);

        // Check global daily claim limit
        uint256 todaysClaims = dailyClaimCount[currentDay];
        if (todaysClaims >= dailyClaimLimit) revert GlobalDailyClaimLimitExceeded();

        // Check FID blacklist
        if (fidInfo[fid].blacklisted) revert FIDBlacklisted();

        // Check GM status (only if contract is set)
        address gmContract = dailyGMContract; // Cache storage read
        if (gmContract != address(0)) {
            if (IDailyGM(gmContract).lastGMDay(claimer) != currentDay)
                revert MustGMToday();
        }

        // Check per-FID-per-day limit
        bytes32 claimKey = keccak256(abi.encode(fid, currentDay));
        if (claimedByDay[claimKey]) revert AlreadyClaimedFIDToday();

        // Check vault balance (cache storage reads)
        uint256 reward = claimRewardAmount;
        uint256 minReserve = minVaultBalance;
        if (rewardToken.balanceOf(_self) < reward + minReserve)
            revert InsufficientVaultBalance();

        // Execute claim (effects before interactions) - follows Checks-Effects-Interactions pattern
        usedSignatures[signature] = true;
        unchecked {
            nonces[claimer]++; // Safe: would take billions of years to overflow
        }
        claimedByDay[claimKey] = true;

        // Update user claim info and global claim counter
        userInfo[claimer].lastClaimDay = currentDay;
        unchecked {
            dailyClaimCount[currentDay]++; // Safe: bounded by dailyClaimLimit check
        }

        // Transfer tokens (interaction)
        rewardToken.safeTransfer(claimer, reward);
        emit Claimed(claimer, fid, reward);
    }

    /// @dev Deposits reward tokens into the vault for rewards.
    /// @notice Deposits reward tokens into the vault.
    /// @param amount The amount of reward tokens to deposit (must be non-zero)
    function deposit(uint256 amount) external payable onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        rewardToken.safeTransferFrom(msg.sender, _self, amount);
    }

    /// @notice Allows a user to invalidate all their pending signatures by incrementing their nonce.
    /// @dev Anyone can call this to invalidate their own pending signatures (useful if signature is compromised).
    function invalidatePendingSignatures() external {
        unchecked {
            nonces[msg.sender]++; // Safe: would take billions of years to overflow
        }
    }

    /// @dev Returns the current vault balance, minimum reserve, and available amount for claims.
    /// @notice Returns the current vault balance, minimum reserve, and available claims amount.
    function getVaultStatus()
        external
        view
        returns (
            uint256 currentBalance,
            uint256 minReserve,
            uint256 availableForClaims
        )
    {
        currentBalance = rewardToken.balanceOf(_self);
        minReserve = minVaultBalance;

        unchecked {
            // Safe: underflow check is in the ternary
            availableForClaims = currentBalance > minReserve
                ? currentBalance - minReserve
                : 0;
        }
    }

    /// @notice Check if a given claimer can claim today for a specific fid
    /// @return status A struct containing claim eligibility details
    /// @dev Checks claim eligibility and returns detailed status.
    function canClaimToday(
        address claimer,
        uint256 fid
    ) external view returns (ClaimStatus memory status) {
        if (claimer == address(0)) revert ZeroAddress();

        uint256 day = block.timestamp / SECONDS_PER_DAY;
        bytes32 claimKey = keccak256(abi.encode(fid, day));

        // Cache storage reads
        bool fidIsBlacklisted = fidInfo[fid].blacklisted;
        bool fidClaimedToday = claimedByDay[claimKey];
        uint256 globalClaimsToday = dailyClaimCount[day];
        bool globalLimitReached = globalClaimsToday >= dailyClaimLimit;

        // Early exit optimizations
        bool hasSentGMToday = true;
        address gmContract = dailyGMContract;
        if (gmContract != address(0)) {
            hasSentGMToday = (IDailyGM(gmContract).lastGMDay(claimer) == day);
        }

        uint256 reward = claimRewardAmount;
        uint256 vaultBalance = rewardToken.balanceOf(_self);
        uint256 minReserve = minVaultBalance;

        bool ok = !fidIsBlacklisted &&
            !fidClaimedToday &&
            !globalLimitReached &&
            hasSentGMToday &&
            vaultBalance >= reward + minReserve;

        status = ClaimStatus({
            ok: ok,
            fidIsBlacklisted: fidIsBlacklisted,
            fidClaimedToday: fidClaimedToday,
            globalLimitReached: globalLimitReached,
            hasSentGMToday: hasSentGMToday,
            reward: reward,
            vaultBalance: vaultBalance,
            minReserve: minReserve,
            globalClaimsToday: globalClaimsToday,
            globalClaimLimit: dailyClaimLimit
        });
    }

    /// @dev Updates the blacklist status for multiple FIDs.
    /// @notice Updates the blacklist status for multiple FIDs.
    /// @param fids Array of FID IDs to update (max 100 per call to prevent gas limit DoS)
    /// @param isBlacklisted Whether to blacklist or remove from blacklist
    function updateBlacklist(
        uint256[] calldata fids,
        bool isBlacklisted
    ) external payable onlyOwner {
        uint256 len = fids.length;
        if (len > MAX_BATCH_SIZE) revert BatchTooLarge();

        for (uint256 i; i < len; ) {
            FidInfo storage fInfo = fidInfo[fids[i]];
            if (fInfo.blacklisted != isBlacklisted) {
                fInfo.blacklisted = isBlacklisted;
            }
            unchecked {
                ++i;
            } // Safe: i < len
        }
        emit BlacklistUpdated(fids, isBlacklisted);
    }

    /// @dev Allows owner to withdraw excess reward tokens while maintaining minimum reserve.
    /// @notice Withdraws excess reward tokens while maintaining minimum reserve.
    /// @param amount The amount of reward tokens to withdraw (must leave minimum reserve intact)
    function emergencyWithdraw(
        uint256 amount
    ) external payable onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (rewardToken.balanceOf(_self) < amount + minVaultBalance)
            revert BelowMinimumReserve();
        rewardToken.safeTransfer(owner(), amount);
    }

    /// @dev Updates the minimum vault balance requirement.
    /// @notice Sets the minimum vault balance requirement.
    /// @param _minVaultBalance The new minimum vault balance (must be non-zero)
    function setMinVaultBalance(
        uint256 _minVaultBalance
    ) external payable onlyOwner {
        if (_minVaultBalance == 0) revert ZeroAmount();
        if (_minVaultBalance == minVaultBalance) revert SameValue();

        uint256 oldValue = minVaultBalance;
        minVaultBalance = _minVaultBalance;
        emit MinVaultBalanceUpdated(oldValue, _minVaultBalance);
    }

    /// @dev Updates the daily claim reward amount.
    /// @notice Sets the amount of reward tokens distributed per successful claim.
    /// @param _claimRewardAmount The new reward amount per claim (must be non-zero)
    function setClaimRewardAmount(
        uint256 _claimRewardAmount
    ) external payable onlyOwner {
        if (_claimRewardAmount == 0) revert ZeroAmount();
        if (_claimRewardAmount == claimRewardAmount) revert SameValue();

        uint256 oldValue = claimRewardAmount;
        claimRewardAmount = _claimRewardAmount;
        emit ClaimRewardAmountUpdated(oldValue, _claimRewardAmount);
    }

    /// @dev Updates the global daily claim limit.
    /// @notice Sets the maximum number of claims allowed per day across all users.
    /// @param _dailyClaimLimit The new global daily claim limit (must be non-zero)
    function setDailyClaimLimit(
        uint256 _dailyClaimLimit
    ) external payable onlyOwner {
        if (_dailyClaimLimit == 0) revert ZeroAmount();
        if (_dailyClaimLimit == dailyClaimLimit) revert SameValue();

        uint256 oldValue = dailyClaimLimit;
        dailyClaimLimit = _dailyClaimLimit;
        emit DailyClaimLimitUpdated(oldValue, _dailyClaimLimit);
    }

    /// @dev Updates the backend signer address.
    /// @notice Sets the address authorized to sign claim authorizations.
    /// @param _backendSigner The new backend signer address (must be non-zero)
    function setBackendSigner(address _backendSigner) external payable onlyOwner {
        if (_backendSigner == address(0)) revert ZeroAddress();
        if (_backendSigner == backendSigner) revert SameValue();

        address oldSigner = backendSigner;
        backendSigner = _backendSigner;
        emit BackendSignerUpdated(oldSigner, _backendSigner);
    }

    /// @dev Updates the reward token address.
    /// @notice Sets the ERC20 token to use for rewards.
    /// @param _rewardToken The new reward token address (must be non-zero)
    function setRewardToken(address _rewardToken) external payable onlyOwner {
        if (_rewardToken == address(0)) revert ZeroAddress();
        if (_rewardToken == address(rewardToken)) revert SameValue();

        address oldToken = address(rewardToken);
        rewardToken = IERC20(_rewardToken);
        emit RewardTokenUpdated(oldToken, _rewardToken);
    }

    /// @dev Updates the DailyGM contract address.
    /// @notice Sets the DailyGM contract address for GM verification.
    /// @param _dailyGMContract The new DailyGM contract address (can be zero address to disable GM checks)
    function setDailyGMContract(
        address _dailyGMContract
    ) external payable onlyOwner {
        if (_dailyGMContract == address(0)) revert ZeroAddress();
        if (_dailyGMContract == dailyGMContract) revert SameValue();

        address oldContract = dailyGMContract;
        dailyGMContract = _dailyGMContract;
        emit DailyGMContractUpdated(oldContract, _dailyGMContract);
    }
}
