pragma solidity ^0.8.7;

import "../interface/ApproveAndCallFallBack.sol";

contract ApproveAndCallFallBackTest is ApproveAndCallFallBack {
    event LogTestReceiveApproval(address from, uint256 _amount, address _token);

    function receiveApproval(address _from, uint256 _amount, bytes calldata /* _data */) override external {
        emit LogTestReceiveApproval(_from, _amount, msg.sender);
    }
}