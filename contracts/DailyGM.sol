// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

contract DailyGM {
    /// @notice Mapping to track each user's last GM day (UTC day number)
    mapping(address user => uint256 lastGMDay) public lastGMDay;

    /// @notice Event emitted when a new GM is recorded
    event GM(address indexed user, address indexed recipient);

    /// @notice Function to say GM
    /// @dev Used to record a GM for the caller
    /// @dev Recipient set to address zero, since GM is not for a specific user
    /// @dev Ensures caller can only GM once per UTC day
    function gm() external {
        _checkDailyLimit();

        lastGMDay[msg.sender] = _currentDay();

        emit GM(msg.sender, address(0));
    }

    /// @notice Function to GM to a recipient
    /// @dev Prevents self-GM
    function gmTo(address recipient) external {
        if (recipient == msg.sender) {
            revert("Cannot GM to yourself");
        }

        _checkDailyLimit();

        lastGMDay[msg.sender] = _currentDay();

        emit GM(msg.sender, recipient);
    }

    /// @dev Private function to check if caller has already GMed today
    function _checkDailyLimit() private view {
        if (lastGMDay[msg.sender] == _currentDay()) {
            revert("Already GMed today");
        }
    }

    /// @dev Utility: current UTC day number
    function _currentDay() private view returns (uint256) {
        return block.timestamp / 1 days;
    }
}
