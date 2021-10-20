//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ApproveAndCallFallBack {
    function receiveApproval(address _from, uint256 _amount, bytes calldata _data) external;
}
