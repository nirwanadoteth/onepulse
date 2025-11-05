// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @author OnePulse Team
/// @dev Contract for managing daily DEGEN rewards for Farcaster FIDs with EIP-712 signatures.
contract DailyRewards is Ownable2Step, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    IERC20 private constant DEGEN_TOKEN =
        IERC20(0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed); // DEGEN on Base
    uint256 private constant MAX_DEADLINE_WINDOW = 1 hours; // Max signature validity window
    uint256 private constant MAX_CLAIM = 5e18; // 5 DEGEN per day
    uint256 private constant MAX_BATCH_SIZE = 100; // Max FIDs per batch update to prevent gas limit DoS

    /// @notice Address authorized to execute gasless claims on behalf of users.
    address public immutable gaslessOperator;
    /// @notice Minimum DEGEN balance to maintain in the vault as reserve.
    uint256 public minVaultBalance = 1e20; // 100 DEGEN default

    address private immutable _self;

    // --- Storage ---
    struct UserInfo {
        uint256 lastClaimDay; // last claim day number (block.timestamp / 1 days)
        uint256 nonce; // EIP-712 signature nonce
    }
    struct FidInfo {
        bool blacklisted; // whether FID is blacklisted
    }
    struct ClaimStatus {
        bool ok;
        bool fidIsBlacklisted;
        bool fidClaimedToday;
        bool claimerClaimedToday;
        uint256 reward;
        uint256 vaultBalance;
        uint256 minReserve;
    }

    /// @notice Mapping of FID to their blacklist status and information.
    mapping(uint256 => FidInfo) public fidInfo; // fid => info
    /// @notice Mapping of claimer addresses to their claim information (last claim day and nonce).
    mapping(address => UserInfo) public userInfo; // claimer => info
    /// @notice Mapping tracking which FIDs have claimed on each specific day (key = keccak256(abi.encode(fid, day))).
    mapping(bytes32 => bool) public claimedByDay;

    // --- EIP-712 Types ---
    bytes32 private constant CLAIM_TYPEHASH =
        keccak256(
            "Claim(address claimer,uint256 fid,uint256 deadline,uint256 nonce)"
        );

    // --- Events ---
    event Claimed(
        address indexed recipient,
        uint256 indexed fid,
        uint256 amount
    );
    event BlacklistUpdated(uint256[] indexed fids, bool isBlacklisted);
    event GaslessClaimExecuted(
        address indexed operator,
        address indexed claimer,
        uint256 indexed fid
    );
    event MinVaultBalanceUpdated(uint256 oldValue, uint256 newValue);

    /// @notice Initializes the contract with gasless operator and minimum vault balance.
    /// @dev Initializes the contract with gasless operator and minimum vault balance.
    constructor(
        address _gaslessOperator,
        uint256 _minVaultBalance
    ) payable Ownable(msg.sender) EIP712("DailyRewards", "1") {
        require(_gaslessOperator != address(0), "Zero address");
        require(_minVaultBalance != 0, "Zero min balance");
        _self = address(this);
        gaslessOperator = _gaslessOperator;
        minVaultBalance = _minVaultBalance;
    }

    /// @dev Allows a user to claim daily rewards for their FID using an EIP-712 signature.
    /// @notice Claims daily rewards for the caller's FID using an EIP-712 signature.
    function claim(
        uint256 fid,
        uint256 deadline,
        bytes memory signature
    ) external nonReentrant {
        require(msg.sender != address(0), "Zero claimer");
        _validateClaim(msg.sender, fid, deadline, signature);
        _executeClaim(msg.sender, fid);
    }

    /// @dev Allows the gasless operator to execute a claim on behalf of a user.
    /// @notice Executes a claim on behalf of a user via gasless operator.
    function executeGaslessClaim(
        address claimer,
        uint256 fid,
        uint256 deadline,
        bytes memory signature
    ) external nonReentrant {
        require(claimer != address(0), "Zero claimer");
        require(msg.sender == gaslessOperator, "Unauthorized");
        _validateClaim(claimer, fid, deadline, signature);
        _executeClaim(claimer, fid);
    }

    /// @dev Internal function to validate claim parameters, signature, and eligibility.
    function _validateClaim(
        address claimer,
        uint256 fid,
        uint256 deadline,
        bytes memory signature
    ) internal {
        require(claimer != address(0), "Zero claimer");
        uint256 currentNonce = userInfo[claimer].nonce;
        IERC20 token = DEGEN_TOKEN;
        require(block.timestamp <= deadline, "Sig expired");
        require(
            deadline <= block.timestamp + MAX_DEADLINE_WINDOW,
            "Long deadline"
        );
        FidInfo storage fInfo = fidInfo[fid];
        _checkDailyLimit(claimer);
        require(!fInfo.blacklisted, "FID blacklisted");
        // Enforce per-FID-per-day: disallow second claim for same fid on same day
        bytes32 claimKey = keccak256(abi.encodePacked(fid, _currentDay()));
        require(!claimedByDay[claimKey], "Already claimed (FID today)");
        require(
            token.balanceOf(_self) >= MAX_CLAIM + minVaultBalance,
            "Low balance"
        );

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(CLAIM_TYPEHASH, claimer, fid, deadline, currentNonce)
            )
        );
        address signer = ECDSA.recover(digest, signature);
        require(signer == claimer, "Bad sig");
        userInfo[claimer].nonce = currentNonce + 1;
    }

    /// @dev Internal function to execute the claim by updating state and transferring tokens.
    function _executeClaim(address claimer, uint256 fid) internal {
        require(claimer != address(0), "Zero claimer");
        uint256 reward = MAX_CLAIM;
        // Mark claimed for this fid on current day
        bytes32 claimKey = keccak256(abi.encodePacked(fid, _currentDay()));
        claimedByDay[claimKey] = true;
        uint256 newClaimDay = _currentDay();
        uint256 prevClaimDay = userInfo[claimer].lastClaimDay;
        // Update last claim day only if it changed to avoid redundant storage writes
        if (prevClaimDay != newClaimDay) {
            userInfo[claimer].lastClaimDay = newClaimDay;
        }

        IERC20 token = DEGEN_TOKEN;
        token.safeTransfer(claimer, reward);
        emit Claimed(claimer, fid, reward);
        // Emit gasless-specific event only if executed by the gasless operator
        if (msg.sender == gaslessOperator) {
            emit GaslessClaimExecuted(msg.sender, claimer, fid);
        }
    }

    /// @dev Deposits DEGEN tokens into the vault for rewards.
    /// @notice Deposits DEGEN tokens into the vault.
    function deposit(uint256 amount) external payable onlyOwner {
        require(amount != 0, "Zero amount");
        IERC20 token = DEGEN_TOKEN;
        token.safeTransferFrom(msg.sender, _self, amount);
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
        uint256 minReserveCached = minVaultBalance;
        minReserve = minReserveCached;
        availableForClaims = currentBalance > minReserveCached
            ? currentBalance - minReserveCached
            : 0;
    }

    /// @dev Returns a formatted string of the vault's DEGEN balance.
    /// @notice Returns a formatted string of the vault's DEGEN balance.
    function getFormattedBalance() external view returns (string memory) {
        IERC20 token = DEGEN_TOKEN;
        uint256 balance = token.balanceOf(_self);
        uint256 degenAmount = balance / 1e18;
        uint256 decimals = (balance % 1e18) / 1e16;
        return
            string(
                bytes.concat(
                    bytes(Strings.toString(degenAmount)),
                    bytes("."),
                    bytes(decimals < 10 ? "0" : ""),
                    bytes(Strings.toString(decimals)),
                    bytes(" DEGEN")
                )
            );
    }

    /// @notice Check if a given claimer can claim today for a specific fid
    /// @return status A struct containing claim eligibility details
    /// @dev Checks claim eligibility and returns detailed status.
    function canClaimToday(
        address claimer,
        uint256 fid
    ) external view returns (ClaimStatus memory status) {
        require(claimer != address(0), "Zero claimer");
        uint256 day = _currentDay();
        bytes32 claimKey = keccak256(abi.encodePacked(fid, day));
        FidInfo storage fInfo = fidInfo[fid];
        bool fidIsBlacklisted = fInfo.blacklisted;
        bool fidClaimedToday = claimedByDay[claimKey];
        bool claimerClaimedToday = (userInfo[claimer].lastClaimDay == day);
        uint256 reward = MAX_CLAIM;
        uint256 vaultBalance = DEGEN_TOKEN.balanceOf(_self);
        uint256 minReserve = minVaultBalance;
        bool ok = (!fidIsBlacklisted &&
            !fidClaimedToday &&
            !claimerClaimedToday &&
            (vaultBalance >= reward + minReserve));
        status.ok = ok;
        status.fidIsBlacklisted = fidIsBlacklisted;
        status.fidClaimedToday = fidClaimedToday;
        status.claimerClaimedToday = claimerClaimedToday;
        status.reward = reward;
        status.vaultBalance = vaultBalance;
        status.minReserve = minReserve;
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
        require(len <= MAX_BATCH_SIZE, "Batch too large");
        for (uint256 i = 0; i < len; ) {
            uint256 id = fids[i];
            FidInfo storage fInfoLoop = fidInfo[id];
            // Update blacklist status only if it changed to avoid redundant storage writes
            if (fInfoLoop.blacklisted != isBlacklisted) {
                fInfoLoop.blacklisted = isBlacklisted;
            }
            unchecked {
                i++;
            }
        }
        emit BlacklistUpdated(fids, isBlacklisted);
    }

    /// @dev Allows owner to withdraw excess DEGEN while maintaining minimum reserve.
    /// @notice Withdraws excess DEGEN while maintaining minimum reserve.
    function emergencyWithdraw(uint256 amount) external payable onlyOwner {
        require(amount != 0, "Zero amount");
        IERC20 token = DEGEN_TOKEN;
        require(
            token.balanceOf(_self) >= amount + minVaultBalance,
            "Below min"
        );
        token.safeTransfer(owner(), amount);
    }

    /// @dev Updates the minimum vault balance requirement.
    /// @notice Sets the minimum vault balance requirement.
    function setMinVaultBalance(
        uint256 _minVaultBalance
    ) external payable onlyOwner {
        require(_minVaultBalance != 0, "Zero min balance");
        require(_minVaultBalance != minVaultBalance, "Same value");
        uint256 oldValue = minVaultBalance;
        minVaultBalance = _minVaultBalance;
        emit MinVaultBalanceUpdated(oldValue, _minVaultBalance);
    }

    /// @dev Private function to check if caller has already claimed today
    function _checkDailyLimit(address claimer) private view {
        require(claimer != address(0), "Zero claimer");
        require(
            userInfo[claimer].lastClaimDay != _currentDay(),
            "Already claimed today"
        );
    }

    /// @dev Utility: current UTC day number
    function _currentDay() private view returns (uint256) {
        return block.timestamp / 1 days;
    }
}
