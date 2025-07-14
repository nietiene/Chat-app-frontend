import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ChangeGroupPhoto() {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChangePhoto = async (e) => {
        e.preventDefault();
        if (!photo) return alert('Please select a photo');

        const formData = new FormData();
        formData.append('photo', photo);

        setLoading(true);
    }
}