

import { useState, useEffect } from "react";
import api from "@/app/services/api"; 

interface Level {
 id: number;
 code: string;
 name: string;
}

interface Skill {
skillId: number; name: string;
levels: Level[];
}

export const useSkillMenuData = () => {
    const [menuData, setMenuData] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await api.get("/topbar-controller/get-topbar");
                setMenuData(res.data);
            } catch (err) {
                console.error("Lỗi load menu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, []);

    const skills = menuData.filter(skill => 
        ['listening', 'reading', 'writing', 'speaking'].includes(skill.name.toLowerCase())
    );

    return { skills, loading };
};