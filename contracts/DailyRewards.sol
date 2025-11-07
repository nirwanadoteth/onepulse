// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/// @notice Interface for DailyGM contract
interface IDailyGM {
    function lastGMDay(address user) external view returns (uint256);
}

/// @author OnePulse Team
/// @title Daily DEGEN Rewards Contract
/// @dev Contract for managing daily DEGEN rewards for Farcaster FIDs with self-signed authorizations.
/// @notice Uses personal_sign (EIP-191) and EIP-1271 for universal wallet compatibility
/// @notice Supports EOA wallets, smart wallets (Coinbase Smart Wallet, Safe), and passkey-based wallets
/// @notice Replay protection uses signature mapping instead of nonces for gas efficiency and simplicity
contract DailyRewards is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using SignatureChecker for address;

    IERC20 private constant DEGEN_TOKEN =
        IERC20(0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed); // DEGEN on Base
    uint256 private constant MAX_DEADLINE_WINDOW = 5 minutes; // Max signature validity window
    uint256 private constant MAX_BATCH_SIZE = 100; // Max FIDs per batch update to prevent gas limit DoS
    uint256 private constant SECONDS_PER_DAY = 1 days;

    /// @notice Minimum DEGEN balance to maintain in the vault as reserve.
    uint256 public minVaultBalance = 100e18; // 100 DEGEN default
    /// @notice Daily reward amount per claim in DEGEN tokens.
    uint256 public claimRewardAmount = 5e18; // 5 DEGEN default
    /// @notice Address of the DailyGM contract to check GM status.
    address public dailyGMContract;
    // Cache for address(this) to save gas on repeated usage
    address private immutable _self;

    // Storage
    struct UserInfo {
        uint48 lastClaimDay; // last claim day number (block.timestamp / 1 days) - uint48 sufficient until year ~8.9M
        uint48 reserved1; // Reserved for future use (packed in same slot, no extra cost)
        uint160 reserved2; // Reserved for future use (completes the 256-bit slot)
    }
    struct FidInfo {
        bool blacklisted; // whether FID is blacklisted (1 byte)
        uint48 blacklistedSince; // day when blacklisted (0 if not blacklisted) - packed in same slot
        uint48 reserved1; // Reserved for future use
        uint160 reserved2; // Reserved for future use (completes the 256-bit slot)
    }
    struct ClaimStatus {
        bool ok;
        bool fidIsBlacklisted;
        bool fidClaimedToday;
        bool claimerClaimedToday;
        bool hasSentGMToday;
        uint256 reward;
        uint256 vaultBalance;
        uint256 minReserve;
    }

    /// @notice Mapping of FID to their blacklist status and information.
    /// @dev Maps Farcaster FID to FidInfo struct containing blacklist status
    mapping(uint256 => FidInfo) public fidInfo;

    /// @notice Mapping of claimer addresses to their claim information (last claim day).
    /// @dev Maps user address to UserInfo struct containing last claim day
    mapping(address => UserInfo) public userInfo;

    /// @notice Mapping tracking which FIDs have claimed on each specific day (key = keccak256(abi.encode(fid, day))).
    /// @dev Uses keccak256(abi.encode(fid, day)) as key to track daily claims per FID - safer than encodePacked
    mapping(bytes32 => bool) public claimedByDay;

    /// @notice Mapping to track used signatures to prevent replay attacks.
    /// @dev Stores signature bytes as key to prevent signature reuse across claims
    mapping(bytes => bool) public usedSignatures;

    /// @notice Mapping of claimer addresses to their current nonce for signature validation.
    /// @dev Optional nonce system for additional front-running protection. Users can increment their nonce to invalidate old signatures.
    mapping(address => uint256) public nonces;

    // Events
    /// @dev Emitted when a user successfully claims their daily DEGEN reward
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
    error AlreadyClaimedUserToday();
    error InsufficientVaultBalance();
    error BatchTooLarge();
    error BelowMinimumReserve();
    error SameValue();

    /// @notice Initializes the contract with the DailyGM contract address.
    /// @dev Initializes the contract with the DailyGM contract address.
    constructor(address _dailyGMContract) payable Ownable(msg.sender) {
        if (_dailyGMContract == address(0)) revert ZeroAddress();
        _self = address(this);
        dailyGMContract = _dailyGMContract;
    }

    /// @dev Allows anyone to claim daily rewards with their own signature.
    /// @notice Claims daily rewards using a self-signed authorization. Works with any wallet type.
    /// @param claimer The address that will receive the DEGEN rewards
    /// @param fid The Farcaster FID associated with this claim
    /// @param nonce The nonce for this claim (must match claimer's current nonce)
    /// @param deadline The timestamp when this signature expires (max 1 hour from creation)
    /// @param signature The claimer's signature authorizing this claim
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

        // Signature verification - verify the claimer signed the message with nonce
        bytes32 messageHash = keccak256(
            abi.encodePacked(claimer, fid, nonce, deadline, _self)
        );

        // Add Ethereum Signed Message prefix
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

        // Use SignatureChecker to support both EOA (ECDSA) and Smart Wallet (EIP-1271) signatures
        // This works with passkeys, Coinbase Smart Wallet, Safe, and all EIP-1271 compliant wallets
        bool isValidSignature = SignatureChecker.isValidSignatureNow(
            claimer,
            ethSignedMessageHash,
            signature
        );

        if (!isValidSignature) revert InvalidSignature();

        // Mark signature as used and increment nonce
        usedSignatures[signature] = true;
        unchecked {
            nonces[claimer]++; // Safe: would take billions of years to overflow
        }

        // Validate eligibility (inlined and optimized)
        uint48 currentDay = uint48(timestamp / SECONDS_PER_DAY);

        // Check daily limit (inlined _checkDailyLimit)
        if (userInfo[claimer].lastClaimDay == currentDay)
            revert AlreadyClaimedUserToday();

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
        if (DEGEN_TOKEN.balanceOf(_self) < reward + minReserve)
            revert InsufficientVaultBalance();

        // Execute claim (effects before interactions)
        claimedByDay[claimKey] = true;
        userInfo[claimer].lastClaimDay = currentDay; // Packed storage write - only writes once!

        // Transfer tokens (interaction)
        DEGEN_TOKEN.safeTransfer(claimer, reward);
        emit Claimed(claimer, fid, reward);
    }

    /// @dev Deposits DEGEN tokens into the vault for rewards.
    /// @notice Deposits DEGEN tokens into the vault.
    /// @param amount The amount of DEGEN tokens to deposit (must be non-zero)
    function deposit(uint256 amount) external payable onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        DEGEN_TOKEN.safeTransferFrom(msg.sender, _self, amount);
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
        currentBalance = DEGEN_TOKEN.balanceOf(_self);
        minReserve = minVaultBalance;

        unchecked {
            // Safe: underflow check is in the ternary
            availableForClaims = currentBalance > minReserve
                ? currentBalance - minReserve
                : 0;
        }
    }

    /// @dev Returns a formatted string of the vault's DEGEN balance.
    /// @notice Returns a formatted string of the vault's DEGEN balance.
    function getFormattedBalance() external view returns (string memory) {
        uint256 balance = DEGEN_TOKEN.balanceOf(_self);

        unchecked {
            // Safe: division and modulo cannot overflow
            uint256 degenAmount = balance / 1e18;
            uint256 decimals = (balance % 1e18) / 1e16;

            return
                string(
                    bytes.concat(
                        bytes(Strings.toString(degenAmount)),
                        bytes("."),
                        decimals < 10 ? bytes("0") : bytes(""),
                        bytes(Strings.toString(decimals)),
                        bytes(" DEGEN")
                    )
                );
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
        bool claimerClaimedToday = (userInfo[claimer].lastClaimDay == day);

        // Early exit optimizations
        bool hasSentGMToday = true;
        address gmContract = dailyGMContract;
        if (gmContract != address(0)) {
            hasSentGMToday = (IDailyGM(gmContract).lastGMDay(claimer) == day);
        }

        uint256 reward = claimRewardAmount;
        uint256 vaultBalance = DEGEN_TOKEN.balanceOf(_self);
        uint256 minReserve = minVaultBalance;

        bool ok = !fidIsBlacklisted &&
            !fidClaimedToday &&
            !claimerClaimedToday &&
            hasSentGMToday &&
            vaultBalance >= reward + minReserve;

        status = ClaimStatus({
            ok: ok,
            fidIsBlacklisted: fidIsBlacklisted,
            fidClaimedToday: fidClaimedToday,
            claimerClaimedToday: claimerClaimedToday,
            hasSentGMToday: hasSentGMToday,
            reward: reward,
            vaultBalance: vaultBalance,
            minReserve: minReserve
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

    /// @dev Allows owner to withdraw excess DEGEN while maintaining minimum reserve.
    /// @notice Withdraws excess DEGEN while maintaining minimum reserve.
    /// @param amount The amount of DEGEN to withdraw (must leave minimum reserve intact)
    function emergencyWithdraw(uint256 amount) external payable onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (DEGEN_TOKEN.balanceOf(_self) < amount + minVaultBalance)
            revert BelowMinimumReserve();
        DEGEN_TOKEN.safeTransfer(owner(), amount);
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
    /// @notice Sets the amount of DEGEN tokens distributed per successful claim.
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

    /// @dev Updates the DailyGM contract address.
    /// @notice Sets the DailyGM contract address for GM verification.
    /// @param _dailyGMContract The new DailyGM contract address (must be non-zero)
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
