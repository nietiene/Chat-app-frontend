import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ChangeGroupPhoto() {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChangePhoto
}