"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type {
    CachDanhGia,
    DangKyHocPhan,
    DiemSo,
    GiangVien,
    LopHocPhan,
    SinhVien,
} from "@/features/diem-so/types";
import {
    createDiemSo,
    deleteDiemSo,
    listCachDanhGia,
    listDangKy,
    listDeCuong,
    listDiemSo,
    listGiangVien,
    listLopHocPhan,
    listSinhVien,
    updateDiemSo,
} from "@/features/diem-so/api";

type Mode = "create" | "edit";

type DisplayRow = {
    maDangKy: string;
    MSSV: string;
    hoTen?: string;
    diemItems: DiemSo[];
    tiLeHoanThanh?: string;
};

type BulkEditRow = {
    key: string;
    maCDG: string;
    tenThanhPhan: string;
    loai?: string | null;
    trongSo: string;
    diem?: string;
    MSGV?: string | null;
};

export default function DiemSoPage() {
    const qc = useQueryClient();

    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<{ maDangKy: string; MSSV: string; hoTen?: string } | null>(null);
    const [bulkValues, setBulkValues] = useState<Record<string, { diem?: string; MSGV?: string | null }>>({});

    const { data: classes = [] } = useQuery({
        queryKey: ["lop-hoc-phan"],
        queryFn: listLopHocPhan,
    });

    const { data: students = [] } = useQuery({
        queryKey: ["sinh-vien"],
        queryFn: () => listSinhVien({}),
    });

    const { data: giangViens = [] } = useQuery({
        queryKey: ["giang-vien"],
        queryFn: listGiangVien,
    });

    const classOptions = useMemo(
        () =>
            classes.map((c: LopHocPhan) => ({
                label: `${c.maLopHocPhan} (K${c.khoa}-HK${c.hocKy})`,
                value: c.maLopHocPhan,
            })),
        [classes]
    );

    const selectedClassData = useMemo(
        () => classes.find((c) => c.maLopHocPhan === selectedClass),
        [classes, selectedClass]
    );

    const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
        queryKey: ["dang-ky-hoc-phan", { selectedClass }],
        enabled: !!selectedClass,
        queryFn: () => listDangKy(selectedClass!),
    });

    const resolvedMaDeCuong = selectedClassData?.maDeCuong;
    const { data: deCuongs = [] } = useQuery({
        queryKey: ["de-cuong-chi-tiet", { maHocPhan: selectedClassData?.maHocPhan }],
        queryFn: () => listDeCuong(selectedClassData!.maHocPhan),
        enabled: !!selectedClassData?.maHocPhan && !resolvedMaDeCuong,
    });

    const maDeCuong = useMemo(() => {
        if (resolvedMaDeCuong) return resolvedMaDeCuong;
        const active = deCuongs.find((dc) => dc.trangThai === "active");
        return active?.maDeCuong ?? deCuongs[0]?.maDeCuong;
    }, [resolvedMaDeCuong, deCuongs]);

    const { data: cdgs = [], isLoading: cdgLoading } = useQuery({
        queryKey: ["cach-danh-gia", { maDeCuong }],
        enabled: !!maDeCuong,
        queryFn: () => listCachDanhGia(maDeCuong!),
    });

    // load điểm cho từng enrollment
    const diemQueries = useQueries({
        queries: enrollments.map((e) => ({
            queryKey: ["diem-so", e.maDangKy],
            queryFn: () => listDiemSo(e.maDangKy),
            enabled: !!selectedClass,
        })),
    });

    const isScoresLoading = diemQueries.some((q) => q.isLoading);

    const rows: DisplayRow[] = useMemo(() => {
        const merged = enrollments.map((e, idx) => {
            const sv = students.find((s) => s.MSSV === e.MSSV);
            return {
                maDangKy: e.maDangKy,
                MSSV: e.MSSV,
                hoTen: sv?.hoTen,
                diemItems: diemQueries[idx]?.data ?? [],
            };
        });

        if (!q.trim()) return merged;

        const s = q.trim().toLowerCase();
        return merged.filter((r) => {
            return r.MSSV.toLowerCase().includes(s) || (r.hoTen ?? "").toLowerCase().includes(s);
        });
    }, [enrollments, diemQueries, students, q]);

    const bulkSaveMut = useMutation({
        mutationFn: async (payload: {
            maDangKy: string;
            originalItems: DiemSo[];
            values: Record<string, { diem?: string; MSGV?: string | null }>;
        }) => {
            const { maDangKy, originalItems, values } = payload;
            const existingMap = new Map(originalItems.map((item) => [item.maCDG, item]));

            for (const cdg of cdgs) {
                const next = values[cdg.maCDG];
                const existed = existingMap.get(cdg.maCDG);
                const nextDiem = next?.diem?.trim();
                const nextMSGV = next?.MSGV ?? null;

                // Để trống điểm => xóa bản ghi nếu đã tồn tại.
                if (!nextDiem) {
                    if (existed) {
                        await deleteDiemSo(maDangKy, cdg.maCDG);
                    }
                    continue;
                }

                if (!existed) {
                    await createDiemSo(maDangKy, {
                        maCDG: cdg.maCDG,
                        diem: nextDiem,
                        MSGV: nextMSGV,
                    });
                    continue;
                }

                const oldDiem = String(existed.diem);
                const oldMSGV = existed.MSGV ?? null;
                if (oldDiem !== nextDiem || oldMSGV !== nextMSGV) {
                    await updateDiemSo(maDangKy, cdg.maCDG, {
                        diem: nextDiem,
                        MSGV: nextMSGV,
                    });
                }
            }
        },
        onSuccess: async () => {
            message.success("Đã lưu điểm thành phần");
            setOpen(false);
            setEditing(null);
            await qc.invalidateQueries({ queryKey: ["diem-so"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Lưu điểm thất bại"),
    });

    const giangVienOptions = useMemo(
        () =>
            giangViens.map((gv: GiangVien) => ({
                label: `${gv.hoTen} (${gv.MSGV})`,
                value: gv.MSGV,
            })),
        [giangViens]
    );

    const columns: ColumnsType<DisplayRow> = [
        {
            title: "Sinh viên",
            dataIndex: "MSSV",
            width: 260,
            render: (_, row) => `${row.hoTen ?? ""} (${row.MSSV})`,
        },
        {
            title: "Điểm thành phần",
            key: "scores",
            render: (_, row) => {
                if (!row.diemItems.length) return <Tag>Chưa có điểm</Tag>;

                return (
                    <Space wrap>
                        {row.diemItems.map((item) => {
                            const cdg = cdgs.find((c) => c.maCDG === item.maCDG);
                            return (
                                <Tag key={item.id} color="blue">
                                    {cdg?.tenThanhPhan ?? item.maCDG}: {item.diem}
                                    {item.tiLeHoanThanh ? ` (${(Number(item.tiLeHoanThanh) * 100).toFixed(2)}%)` : ""}
                                </Tag>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: "Tỉ lệ hoàn thành",
            key: "completion",
            render: (_, row) => {
                if (!row.diemItems.length) return "-";

                return (
                    <Space wrap>
                        {row.diemItems.map((item) => {
                            const cdg = cdgs.find((c) => c.maCDG === item.maCDG);
                            return (
                                <Tag key={item.id} color="green">
                                    {cdg?.tenThanhPhan ?? item.maCDG}:{" "}
                                    {item.tiLeHoanThanh
                                        ? `${(Number(item.tiLeHoanThanh) * 100).toFixed(2)}%`
                                        : "-"}
                                </Tag>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: "Cập nhật",
            key: "updatedAt",
            width: 180,
            render: (_, row) => {
                const latest = [...row.diemItems]
                    .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())[0];
                return latest ? dayjs(latest.updatedAt).format("YYYY-MM-DD HH:mm") : "-";
            },
        },
        {
            title: "Hành động",
            key: "actions",
            width: 180,
            render: (_, row) => (
                <Space wrap>
                    <Button
                        type="primary"
                        onClick={() => {
                            const map: Record<string, { diem?: string; MSGV?: string | null }> = {};
                            row.diemItems.forEach((item) => {
                                map[item.maCDG] = {
                                    diem: String(item.diem),
                                    MSGV: item.MSGV ?? null,
                                };
                            });
                            setBulkValues(map);
                            setEditing({ maDangKy: row.maDangKy, MSSV: row.MSSV, hoTen: row.hoTen });
                            setOpen(true);
                        }}
                    >
                        Sửa điểm
                    </Button>
                </Space>
            ),
        },
    ];

    const bulkRows: BulkEditRow[] = useMemo(() => {
        return cdgs.map((cdg) => ({
            key: cdg.maCDG,
            maCDG: cdg.maCDG,
            tenThanhPhan: cdg.tenThanhPhan,
            loai: cdg.loai,
            trongSo: cdg.trongSo,
            diem: bulkValues[cdg.maCDG]?.diem,
            MSGV: bulkValues[cdg.maCDG]?.MSGV ?? null,
        }));
    }, [cdgs, bulkValues]);

    const bulkColumns: ColumnsType<BulkEditRow> = [
        {
            title: "Thành phần",
            dataIndex: "tenThanhPhan",
            width: 260,
            render: (_, row) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{row.tenThanhPhan}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                        {row.loai ? `${row.loai} • ` : ""}Trọng số: {row.trongSo}
                    </div>
                </div>
            ),
        },
        {
            title: "Điểm",
            dataIndex: "diem",
            width: 170,
            render: (_value, row) => (
                <InputNumber
                    min={0}
                    max={10}
                    step={0.25}
                    style={{ width: "100%" }}
                    value={row.diem != null && row.diem !== "" ? Number(row.diem) : null}
                    onChange={(v) => {
                        setBulkValues((prev) => ({
                            ...prev,
                            [row.maCDG]: {
                                ...(prev[row.maCDG] ?? {}),
                                diem: v == null ? undefined : String(v),
                            },
                        }));
                    }}
                />
            ),
        },
        {
            title: "Giảng viên nhập",
            dataIndex: "MSGV",
            render: (_value, row) => (
                <Select
                    allowClear
                    options={giangVienOptions}
                    showSearch
                    optionFilterProp="label"
                    style={{ minWidth: 240 }}
                    value={row.MSGV ?? undefined}
                    onChange={(v) => {
                        setBulkValues((prev) => ({
                            ...prev,
                            [row.maCDG]: {
                                ...(prev[row.maCDG] ?? {}),
                                MSGV: v ?? null,
                            },
                        }));
                    }}
                />
            ),
        },
    ];

    const onSubmit = async () => {
        if (!editing) return;
        const touchedValues = Object.values(bulkValues).filter((x) => x?.diem != null && x.diem !== "");
        if (!touchedValues.length) {
            message.warning("Nhập ít nhất 1 điểm thành phần");
            return;
        }
        bulkSaveMut.mutate({
            maDangKy: editing.maDangKy,
            originalItems: rows.find((r) => r.maDangKy === editing.maDangKy)?.diemItems ?? [],
            values: bulkValues,
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
                <Space wrap>
                    <Select
                        style={{ width: 380 }}
                        placeholder="Chọn lớp học phần"
                        options={classOptions}
                        value={selectedClass}
                        onChange={(v) => {
                            setSelectedClass(v);
                            setQ("");
                        }}
                        showSearch
                        optionFilterProp="label"
                    />

                    <Input.Search
                        placeholder="Tìm MSSV / tên sinh viên..."
                        allowClear
                        onSearch={setQ}
                        style={{ width: 280 }}
                        disabled={!selectedClass}
                    />
                </Space>
            </Space>

            <Table
                rowKey="maDangKy"
                loading={(enrollLoading || cdgLoading || isScoresLoading) && !!selectedClass}
                columns={columns}
                dataSource={selectedClass ? rows : []}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={
                    editing ? `Sửa điểm thành phần: ${editing.hoTen ?? ""} (${editing.MSSV})` : "Sửa điểm thành phần"
                }
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                confirmLoading={bulkSaveMut.isPending}
                destroyOnHidden
                width={980}
                okText="Lưu tất cả"
            >
                <Table
                    rowKey="key"
                    size="small"
                    columns={bulkColumns}
                    dataSource={bulkRows}
                    pagination={false}
                    bordered
                />
            </Modal>
        </div>
    );
}