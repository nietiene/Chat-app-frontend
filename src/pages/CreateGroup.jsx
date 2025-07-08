import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function CreateGroup () {

    const [groupName, setGroupName] = useSearchParams('');
    const [allUsers, setAllUsers] = useState([]);
} 