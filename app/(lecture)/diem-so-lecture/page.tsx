"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  InputNumber,
  Modal,
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
  DiemSo,
  Enrollment,
  LecturerClass,
} from "@/features/diem-so-lecture/types";
import {
  createEnrollmentScore,
  listEnrollmentScores,
  listMyClassCachDanhGia,
  listMyClassEnrollments,
  listMyClasses,
  updateEnrollmentScore,
  deleteEnrollmentScore,
} from "@/features/diem-so-lecture/api";

type DisplayRow = {
  maDangKy: string;
  MSSV: string;
  hoTen?: string;
  email?: string | null;
  diemItems: DiemSo[];
};

type BulkEditRow = {
  key: string;
  maCDG: string;
  tenThanhPhan: string;
  loai?: string | null;
  trongSo: string;
  diem?: string;
};

export default function DiemSoLecturePage() {
  const qc = useQueryClient();

  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{
    maDangKy: string;
    MSSV: string;
    hoTen?: string;
  } | null>(null);
  const [bulkValues, setBulkValues] = useState<Record<string, { diem?: string }>>({});

  const { data: classes = [], isLoading: classLoading } = useQuery({
    queryKey: ["lecturer", "my-classes"],
    queryFn: listMyClasses,
  });

  const classOptions = useMemo(
    () =>
      classes.map((c: LecturerClass) => ({
        label: `${c.hocPhan?.tenHocPhan ?? c.maHocPhan} - ${c.maLopHocPhan} (K${c.khoa}-HK${c.hocKy})`,
        value: c.maLopHocPhan,
      })),
    [classes]
  );

  const selectedClassData = useMemo(
    () => classes.find((c) => c.maLopHocPhan === selectedClass),
    [classes, selectedClass]
  );

  const { data: enrollments = [], isLoading: enrollLoading } = useQuery({
    queryKey: ["lecturer", "class-enrollments", selectedClass],
    enabled: !!selectedClass,
    queryFn: () => listMyClassEnrollments(selectedClass!),
  });

  const { data: cdgs = [], isLoading: cdgLoading } = useQuery({
    queryKey: ["lecturer", "class-cach-danh-gia", selectedClass],
    enabled: !!selectedClass,
    queryFn: () => listMyClassCachDanhGia(selectedClass!),
  });

  const diemQueries = useQueries({
    queries: enrollments.map((e: Enrollment) => ({
      queryKey: ["lecturer", "scores", e.maDangKy],
      queryFn: () => listEnrollmentScores(e.maDangKy),
      enabled: !!selectedClass,
    })),
  });

  const isScoresLoading = diemQueries.some((q) => q.isLoading);

  const rows: DisplayRow[] = useMemo(() => {
    const merged = enrollments.map((e, idx) => ({
      maDangKy: e.maDangKy,
      MSSV: e.MSSV,
      hoTen: e.sinhVien?.hoTen,
      email: e.sinhVien?.email,
      diemItems: diemQueries[idx]?.data ?? [],
    }));

    if (!q.trim()) return merged;

    const s = q.trim().toLowerCase();
    return merged.filter((r) => {
      return (
        r.MSSV.toLowerCase().includes(s) ||
        (r.hoTen ?? "").toLowerCase().includes(s) ||
        (r.email ?? "").toLowerCase().includes(s)
      );
    });
  }, [enrollments, diemQueries, q]);

  const bulkSaveMut = useMutation({
    mutationFn: async (payload: {
      maDangKy: string;
      originalItems: DiemSo[];
      values: Record<string, { diem?: string }>;
    }) => {
      const { maDangKy, originalItems, values } = payload;
      const existingMap = new Map(originalItems.map((item) => [item.maCDG, item]));

      for (const cdg of cdgs) {
        const next = values[cdg.maCDG];
        const existed = existingMap.get(cdg.maCDG);
        const nextDiem = next?.diem?.trim();

        if (!nextDiem) {
          if (existed) {
            await deleteEnrollmentScore(maDangKy, cdg.maCDG);
          }
          continue;
        }

        if (!existed) {
          await createEnrollmentScore(maDangKy, {
            maCDG: cdg.maCDG,
            diem: nextDiem,
          });
          continue;
        }

        const oldDiem = String(existed.diem);
        if (oldDiem !== nextDiem) {
          await updateEnrollmentScore(maDangKy, cdg.maCDG, {
            diem: nextDiem,
          });
        }
      }
    },
    onSuccess: async () => {
      message.success("Đã lưu điểm thành phần");
      setOpen(false);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["lecturer", "scores"] });
    },
    onError: (e: any) => {
      message.error(e?.response?.data?.message ?? "Lưu điểm thất bại");
    },
  });

  const columns: ColumnsType<DisplayRow> = [
    {
      title: "Sinh viên",
      dataIndex: "MSSV",
      width: 280,
      render: (_, row) => (
        <div>
          <div>{`${row.hoTen ?? ""} (${row.MSSV})`}</div>
          {row.email ? <div style={{ fontSize: 12, color: "#888" }}>{row.email}</div> : null}
        </div>
      ),
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
                  {item.tiLeHoanThanh
                    ? ` (${(Number(item.tiLeHoanThanh) * 100).toFixed(2)}%)`
                    : ""}
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
        const latest = [...row.diemItems].sort(
          (a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
        )[0];
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
              const map: Record<string, { diem?: string }> = {};
              row.diemItems.forEach((item) => {
                map[item.maCDG] = {
                  diem: String(item.diem),
                };
              });

              setBulkValues(map);
              setEditing({
                maDangKy: row.maDangKy,
                MSSV: row.MSSV,
                hoTen: row.hoTen,
              });
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
    return cdgs.map((cdg: CachDanhGia) => ({
      key: cdg.maCDG,
      maCDG: cdg.maCDG,
      tenThanhPhan: cdg.tenThanhPhan,
      loai: cdg.loai,
      trongSo: cdg.trongSo,
      diem: bulkValues[cdg.maCDG]?.diem,
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
            {row.loai ? `${row.loai} • ` : ""}
            Trọng số: {row.trongSo}
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
  ];

  const onSubmit = async () => {
    if (!editing) return;

    const touchedValues = Object.values(bulkValues).filter(
      (x) => x?.diem != null && x.diem !== ""
    );

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
            style={{ width: 420 }}
            placeholder="Chọn lớp học phần mình phụ trách"
            options={classOptions}
            value={selectedClass}
            onChange={(v) => {
              setSelectedClass(v);
              setQ("");
            }}
            showSearch
            optionFilterProp="label"
            loading={classLoading}
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
          editing
            ? `Sửa điểm thành phần: ${editing.hoTen ?? ""} (${editing.MSSV})`
            : "Sửa điểm thành phần"
        }
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={bulkSaveMut.isPending}
        destroyOnHidden
        width={900}
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