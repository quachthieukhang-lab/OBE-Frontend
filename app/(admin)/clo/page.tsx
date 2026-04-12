"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { CLO, DeCuongChiTiet, HocPhan } from "@/features/clo/types";
import { createClo, deleteClo, listClo, listDeCuong, listHocPhan, updateClo } from "@/features/clo/api";

type Mode = "create" | "edit";

export default function CloPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [maDeCuong, setMaDeCuong] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<CLO | null>(null);

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const hpOptions = useMemo(
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

  // Auto-select active version when đề cương list changes
  useMemo(() => {
    if (!maHocPhan || deCuongs.length === 0) return;
    const active = deCuongs.find((dc) => dc.trangThai === "active");
    if (active) setMaDeCuong(active.maDeCuong);
    else if (deCuongs.length === 1) setMaDeCuong(deCuongs[0].maDeCuong);
  }, [maHocPhan, deCuongs]);

  const cloQueryKey = useMemo(() => ["clo", { maDeCuong }], [maDeCuong]);

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey: cloQueryKey,
    enabled: !!maDeCuong,
    queryFn: () => listClo(maDeCuong!),
  });

  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter((x) => (x.code ?? "").toLowerCase().includes(s) || x.noiDungChuanDauRa.toLowerCase().includes(s));
  }, [rowsRaw, q]);

  const createMut = useMutation({
    mutationFn: async (payload: { maDeCuong: string; data: any }) => createClo(payload.maDeCuong, payload.data),
    onSuccess: async () => {
      message.success("Tạo CLO thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["clo"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: { maDeCuong: string; maCLO: string; data: Partial<CLO> }) =>
      updateClo(payload.maDeCuong, payload.maCLO, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["clo"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maDeCuong: string; maCLO: string }) => deleteClo(payload.maDeCuong, payload.maCLO),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["clo"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<CLO> = [
    { title: "Code", dataIndex: "code", width: 120, render: (v) => (v ? <Tag>{v}</Tag> : "-") },
    { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa", ellipsis: true },
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
              form.setFieldsValue(row);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa CLO?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate({ maDeCuong: maDeCuong!, maCLO: row.maCLO })}
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
    setOpen(true);
  };

  const onSubmit = async () => {
    if (!maDeCuong) return;

    const v = await form.validateFields();
    const data: Partial<CLO> = {
      code: v.code ?? null,
      noiDungChuanDauRa: v.noiDungChuanDauRa,
    };

    if (mode === "create") {
      createMut.mutate({ maDeCuong, data });
      return;
    }

    if (!editing) return;
    updateMut.mutate({ maDeCuong, maCLO: editing.maCLO, data });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Space wrap>
          <Select
            style={{ width: 420 }}
            placeholder="Chọn học phần"
            options={hpOptions}
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
            placeholder="Tìm code / nội dung..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!maDeCuong}
          />
        </Space>

        <Button type="primary" onClick={openCreate} disabled={!maDeCuong}>
          Tạo CLO
        </Button>
      </Space>

      <Table
        rowKey="maCLO"
        loading={isLoading && !!maDeCuong}
        columns={columns}
        dataSource={maDeCuong ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo CLO" : "Sửa CLO"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={900}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Code" name="code">
            <Input placeholder="VD: CLO1" />
          </Form.Item>

          <Form.Item
            label="Nội dung chuẩn đầu ra"
            name="noiDungChuanDauRa"
            rules={[{ required: true, message: "Nhập nội dung chuẩn đầu ra" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
