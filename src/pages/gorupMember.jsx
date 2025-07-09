import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function GroupMember () {
    const { g_id } = useParams();
    const navigate = useNavigate()
}