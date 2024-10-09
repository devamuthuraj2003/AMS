// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {
    struct AttendanceRecord {
        uint totalPresent;
        uint totalAbsent;
        string absentNames; // Store names of absent students as a comma-separated string
    }

    AttendanceRecord[] public records;

    // Event to emit when attendance is stored
    event AttendanceStored(uint totalPresent, uint totalAbsent, string absentNames);

    // Function to store attendance details
    function storeAttendance(uint _totalPresent, uint _totalAbsent, string memory _absentNames) public {
        records.push(AttendanceRecord(_totalPresent, _totalAbsent, _absentNames));
        emit AttendanceStored(_totalPresent, _totalAbsent, _absentNames); // Emit event
    }

    // Function to retrieve a specific attendance record
    function getRecord(uint index) public view returns (AttendanceRecord memory) {
        require(index < records.length, "Index out of bounds");
        return records[index];
    }

    // Function to get the total number of attendance records
    function getRecordsCount() public view returns (uint) {
        return records.length;
    }
}
