import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export interface VietQRBank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
}

export function useVietQRBanks() {
    const [bankList, setBankList] = useState<VietQRBank[]>([]);
    const [bankSearch, setBankSearch] = useState("");
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useState<VietQRBank | null>(null);
    const bankDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch bank list from VietQR API
    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then((res) => res.json())
            .then((json) => {
                if (json.code === "00" && Array.isArray(json.data)) {
                    setBankList(json.data);
                }
            })
            .catch(() => { /* silently fail */ });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(e.target as Node)) {
                setBankDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Filtered list based on search query
    const filteredBanks = useMemo(() => {
        const q = bankSearch.toLowerCase();
        if (!q) return bankList;
        return bankList.filter(
            (b) =>
                b.name.toLowerCase().includes(q) ||
                b.shortName.toLowerCase().includes(q) ||
                b.code.toLowerCase().includes(q),
        );
    }, [bankList, bankSearch]);

    const selectBank = useCallback((bank: VietQRBank) => {
        setSelectedBank(bank);
        setBankDropdownOpen(false);
        setBankSearch("");
    }, []);

    return {
        bankList,
        bankSearch,
        setBankSearch,
        bankDropdownOpen,
        setBankDropdownOpen,
        selectedBank,
        setSelectedBank,
        bankDropdownRef,
        filteredBanks,
        selectBank,
    };
}
