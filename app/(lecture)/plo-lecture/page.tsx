"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ChuongTrinhDaoTao, PLO } from "@/features/plo/types";
// Chỉ import hàm lấy danh sách (list), gỡ bỏ create, update, delete
import { listPlo, listPrograms } from "@/features/plo/api";

export default function PloReadOnlyPage() {
    // chọn CTĐT trước
    const [program, setProgram] = useState<string | undefined>();
    const [q, setQ] = useState("");

    // 1. Fetch danh sách Chương trình đào tạo để đưa vào Select
    const { data: programs = [] } = useQuery({
        queryKey: ["chuong-trinh-dao-tao"],
        queryFn: listPrograms,
    });

    const programOptions = useMemo(
        () =>
            programs.map((p: ChuongTrinhDaoTao) => ({
                label: `${p.tenTiengViet} (${p.maSoNganh})`,
                value: p.maSoNganh,
            })),
        [programs]
    );

    const ploQueryKey = useMemo(() => ["plo", { program }], [program]);

    // 2. Fetch danh sách PLO dựa vào CTĐT đã chọn
    const { data: rowsRaw = [], isLoading } = useQuery({
        queryKey: ploQueryKey,
        enabled: !!program,
        queryFn: () => listPlo(program!),
    });

    // 3. Logic thanh Tìm kiếm (Search)
    const rows = useMemo(() => {
        if (!q.trim()) return rowsRaw;
        const s = q.trim().toLowerCase();
        return rowsRaw.filter((x) => {
            return (
                (x.code ?? "").toLowerCase().includes(s) ||
                x.noiDungChuanDauRa.toLowerCase().includes(s) ||
                (x.nhom ?? "").toLowerCase().includes(s)
            );
        });
    }, [rowsRaw, q]);

    // 4. Cấu hình cột hiển thị (Đã gỡ bỏ cột Hành Động)
    const columns: ColumnsType<PLO> = [
        { 
            title: "Code", 
            dataIndex: "code", 
            width: 110, 
            render: (v) => v ? <Tag color="blue">{v}</Tag> : "-" 
        },
        { 
            title: "Nội dung chuẩn đầu ra PLO", 
            dataIndex: "noiDungChuanDauRa", 
            ellipsis: false, // Tắt ellipsis để dễ đọc
            width: 500 
        },
        { 
            title: "Nhóm", 
            dataIndex: "nhom", 
            width: 120, 
            render: (v) => v ? <Tag>{v}</Tag> : "-" 
        },
        { 
            title: "Mức độ", 
            dataIndex: "mucDo", 
            width: 120, 
            render: (v) => v ?? "-" 
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            width: 100,
            render: (v) => (v === false ? <Tag color="red">OFF</Tag> : <Tag color="green">ON</Tag>),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 20 }} wrap>
                <Space wrap>
                    <Select
                        style={{ width: 360 }}
                        placeholder="Chọn chương trình đào tạo để xem PLO..."
                        options={programOptions}
                        value={program}
                        onChange={(v) => {
                            setProgram(v);
                            setQ(""); // Xóa thanh tìm kiếm khi đổi CTĐT
                        }}
                        showSearch
                        optionFilterProp="label"
                    />

                    <Input.Search
                        placeholder="Tìm theo code / nội dung / nhóm..."
                        allowClear
                        onSearch={setQ}
                        style={{ width: 280 }}
                        disabled={!program} // Khóa ô search nếu chưa chọn CTĐT
                    />
                </Space>
            </Space>

            <Table
                rowKey="maPLO"
                loading={isLoading && !!program}
                columns={columns}
                dataSource={program ? rows : []}
                pagination={{ pageSize: 10 }}
                bordered
            />
        </div>
    );
}