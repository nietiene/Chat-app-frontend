import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../api";

const socket = io('http://localhost:4000', { withCredentials: true })