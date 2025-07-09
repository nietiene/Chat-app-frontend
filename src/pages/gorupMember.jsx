import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function GroupMember () {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/api/groups/group_members/${g_id}`);
                
            }
        }
    })
}