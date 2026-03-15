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
};

export default function DiemSoPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<{ maDangKy: string; item?: DiemSo } | null>(null);

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

  const { data: cdgs = [], isLoading: cdgLoading } = useQuery({
    queryKey: ["cach-danh-gia", { maHocPhan: selectedClassData?.maHocPhan }],
    enabled: !!selectedClassData?.maHocPhan,
    queryFn: () => listCachDanhGia(selectedClassData!.maHocPhan),
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

  const createMut = useMutation({
    mutationFn: async (payload: { maDangKy: string; data: { maCDG: string; diem: string; MSGV?: string | null } }) =>
      createDiemSo(payload.maDangKy, payload.data),
    onSuccess: async () => {
      message.success("Tạo điểm thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["diem-so"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: { maDangKy: string; maCDG: string; data: Partial<{ diem: string; MSGV?: string | null }> }) =>
      updateDiemSo(payload.maDangKy, payload.maCDG, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật điểm thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["diem-so"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maDangKy: string; maCDG: string }) => deleteDiemSo(payload.maDangKy, payload.maCDG),
    onSuccess: async () => {
      message.success("Đã xóa điểm");
      await qc.invalidateQueries({ queryKey: ["diem-so"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const giangVienOptions = useMemo(
    () =>
      giangViens.map((gv: GiangVien) => ({
        label: `${gv.hoTen} (${gv.MSGV})`,
        value: gv.MSGV,
      })),
    [giangViens]
  );

  const cdgOptions = useMemo(
    () =>
      cdgs.map((c: CachDanhGia) => ({
        label: `${c.tenThanhPhan}${c.loai ? ` - ${c.loai}` : ""} (${c.trongSo})`,
        value: c.maCDG,
      })),
    [cdgs]
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
      width: 320,
      render: (_, row) => (
        <Space wrap>
          <Button
            type="primary"
            onClick={() => {
              setMode("create");
              setEditing({ maDangKy: row.maDangKy });
              form.resetFields();
              setOpen(true);
            }}
          >
            Thêm điểm
          </Button>

          {row.diemItems.map((item) => (
            <Space key={item.id}>
              <Button
                size="small"
                onClick={() => {
                  setMode("edit");
                  setEditing({ maDangKy: row.maDangKy, item });
                  form.setFieldsValue({
                    maCDG: item.maCDG,
                    diem: Number(item.diem),
                    MSGV: item.MSGV ?? undefined,
                  });
                  setOpen(true);
                }}
              >
                Sửa
              </Button>

              <Popconfirm
                title="Xóa điểm?"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() =>
                  deleteMut.mutate({ maDangKy: row.maDangKy, maCDG: item.maCDG })
                }
              >
                <Button size="small" danger loading={deleteMut.isPending}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          ))}
        </Space>
      ),
    },
  ];

  const onSubmit = async () => {
    if (!editing) return;

    const v = await form.validateFields();

    const payload = {
      maCDG: v.maCDG,
      diem: String(v.diem),
      MSGV: v.MSGV ?? null,
    };

    if (mode === "create") {
      createMut.mutate({
        maDangKy: editing.maDangKy,
        data: payload,
      });
      return;
    }

    if (!editing.item) return;

    updateMut.mutate({
      maDangKy: editing.maDangKy,
      maCDG: editing.item.maCDG,
      data: {
        diem: payload.diem,
        MSGV: payload.MSGV,
      },
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
        title={mode === "create" ? "Thêm điểm" : "Sửa điểm"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Cách đánh giá"
            name="maCDG"
            rules={[{ required: true, message: "Chọn cách đánh giá" }]}
          >
            <Select
              options={cdgOptions}
              showSearch
              optionFilterProp="label"
              disabled={mode === "edit"}
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Điểm"
              name="diem"
              rules={[{ required: true, message: "Nhập điểm" }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={10}
                step={0.25}
                style={{ width: "100%" }}
                stringMode
              />
            </Form.Item>

            <Form.Item label="Giảng viên nhập" name="MSGV" style={{ flex: 1 }}>
              <Select
                allowClear
                options={giangVienOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}