"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import type { CachDanhGia, DeCuongChiTiet, HocPhan } from "@/features/cach-danh-gia/types";
import {
  createCachDanhGia,
  deleteCachDanhGia,
  listCachDanhGia,
  listDeCuong,
  listHocPhan,
  updateCachDanhGia,
} from "@/features/cach-danh-gia/api";

type Mode = "create" | "edit";

const LOAI_OPTIONS = [
  { label: "quiz", value: "quiz" },
  { label: "assignment", value: "assignment" },
  { label: "project", value: "project" },
  { label: "midterm", value: "midterm" },
  { label: "final", value: "final" },
  { label: "other", value: "other" },
];

export default function CachDanhGiaPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [maDeCuong, setMaDeCuong] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<CachDanhGia | null>(null);

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const hocPhanOptions = useMemo(
    () =>
      hocPhans.map((hp: HocPhan) => ({
        label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
        value: hp.maHocPhan,
      })),
    [hocPhans]
  );

  const { data: deCuongs = [] } = useQuery({
    queryKey: ["de-cuong-chi-tiet", { maHocPhan }],
    queryFn: () => listDeCuong(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const dcOptions = useMemo(
    () =>
      deCuongs.map((dc: DeCuongChiTiet) => ({
        label: `${dc.phienBan} (${dc.trangThai})`,
        value: dc.maDeCuong,
      })),
    [deCuongs]
  );

  useMemo(() => {
    if (!maHocPhan || deCuongs.length === 0) return;
    const active = deCuongs.find((dc) => dc.trangThai === "active");
    if (active) setMaDeCuong(active.maDeCuong);
    else if (deCuongs.length === 1) setMaDeCuong(deCuongs[0].maDeCuong);
  }, [maHocPhan, deCuongs]);

  const queryKey = useMemo(() => ["cach-danh-gia", { maDeCuong }], [maDeCuong]);

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey,
    enabled: !!maDeCuong,
    queryFn: () => listCachDanhGia(maDeCuong!),
  });

  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter((x) => {
      return (
        (x.cachDanhGia ?? "").toLowerCase().includes(s) ||
        x.tenThanhPhan.toLowerCase().includes(s) ||
        (x.loai ?? "").toLowerCase().includes(s)
      );
    });
  }, [rowsRaw, q]);

  const createMut = useMutation({
    mutationFn: async (payload: {
      maDeCuong: string;
      data: Omit<CachDanhGia, "maCDG" | "maDeCuong">;
    }) => createCachDanhGia(payload.maDeCuong, payload.data),
    onSuccess: async () => {
      message.success("Tạo cách đánh giá thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["cach-danh-gia"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: {
      maDeCuong: string;
      maCDG: string;
      data: Partial<CachDanhGia>;
    }) => updateCachDanhGia(payload.maDeCuong, payload.maCDG, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["cach-danh-gia"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maDeCuong: string; maCDG: string }) =>
      deleteCachDanhGia(payload.maDeCuong, payload.maCDG),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["cach-danh-gia"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<CachDanhGia> = [
    {
      title: "Tên thành phần",
      dataIndex: "tenThanhPhan",
      width: 220,
    },
    {
      title: "Cách đánh giá",
      dataIndex: "cachDanhGia",
      render: (v) => v ?? "-",
    },
    {
      title: "Loại",
      dataIndex: "loai",
      width: 120,
      render: (v) => (v ? <Tag>{v}</Tag> : "-"),
    },
    {
      title: "Trọng số",
      dataIndex: "trongSo",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 240,
      render: (_, row) => (
        <Space>
          <Button
            onClick={() => {
              setMode("edit");
              setEditing(row);
              setOpen(true);
              form.setFieldsValue({
                ...row,
                trongSo: Number(row.trongSo),
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa cách đánh giá?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() =>
              deleteMut.mutate({ maDeCuong: maDeCuong!, maCDG: row.maCDG })
            }
          >
            <Button danger loading={deleteMut.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openCreate = () => {
    if (!maDeCuong) return;
    setMode("create");
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      trongSo: 0,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    if (!maDeCuong) return;

    const v = await form.validateFields();

    const data: Partial<CachDanhGia> = {
      tenThanhPhan: v.tenThanhPhan,
      cachDanhGia: v.cachDanhGia ?? null,
      loai: v.loai ?? null,
      trongSo: String(v.trongSo ?? 0),
    };

    if (mode === "create") {
      createMut.mutate({
        maDeCuong,
        data: data as Omit<CachDanhGia, "maCDG" | "maDeCuong">,
      });
      return;
    }

    if (!editing) return;

    updateMut.mutate({
      maDeCuong,
      maCDG: editing.maCDG,
      data,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
        wrap
      >
        <Space wrap>
          <Select
            style={{ width: 420 }}
            placeholder="Chọn học phần"
            options={hocPhanOptions}
            value={maHocPhan}
            onChange={(v) => {
              setMaHocPhan(v);
              setMaDeCuong(undefined);
              setQ("");
            }}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 280 }}
            placeholder="Chọn đề cương"
            options={dcOptions}
            value={maDeCuong}
            onChange={(v) => {
              setMaDeCuong(v);
              setQ("");
            }}
            disabled={!maHocPhan || deCuongs.length === 0}
            showSearch
            optionFilterProp="label"
          />

          <Input.Search
            placeholder="Tìm tên thành phần / loại..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!maDeCuong}
          />
        </Space>

        <Button type="primary" onClick={openCreate} disabled={!maDeCuong}>
          Tạo cách đánh giá
        </Button>
      </Space>

      <Table
        rowKey="maCDG"
        loading={isLoading && !!maDeCuong}
        columns={columns}
        dataSource={maDeCuong ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo cách đánh giá" : "Sửa cách đánh giá"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={820}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên thành phần"
            name="tenThanhPhan"
            rules={[{ required: true, message: "Nhập tên thành phần" }]}
          >
            <Input placeholder="VD: Final Exam" />
          </Form.Item>

          <Form.Item label="Cách đánh giá" name="cachDanhGia">
            <Input placeholder="VD: Thi cuối kỳ" />
          </Form.Item>

          <Space style={{ width: "100%"  }} size={12}>
            <Form.Item label="Loại" name="loai" style={{ flex: 1 }}>
              <Select allowClear options={LOAI_OPTIONS} style={{ minWidth: 150  }}  />
            </Form.Item>

            <Form.Item
              label="Trọng số"
              name="trongSo"
              rules={[{ required: true, message: "Nhập trọng số" }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                style={{ width: "100%" }}
                stringMode
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
