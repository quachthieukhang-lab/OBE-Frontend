"use client";

import { useEffect, useMemo, useState } from "react";
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
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import type {
  ChuongTrinhDaoTao,
  HocPhan,
  ChuongTrinhDaoTaoHocPhan,
} from "@/features/chuong-trinh-dao-tao-hoc-phan/types";
import {
  createProgramCourse,
  deleteProgramCourse,
  listHocPhan,
  listProgramCourses,
  listPrograms,
  updateProgramCourse,
} from "@/features/chuong-trinh-dao-tao-hoc-phan/api";
import { listProgramCohorts } from "@/features/chuong-trinh-nien-khoa/api";
import type { ChuongTrinhNienKhoa } from "@/features/chuong-trinh-nien-khoa/types";

type Mode = "create" | "edit";

export default function ChuongTrinhDaoTaoHocPhanPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [program, setProgram] = useState<string | undefined>();
  const [khoa, setKhoa] = useState<number | undefined>();
  const [q, setQ] = useState("");
  const [hocKyFilter, setHocKyFilter] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<ChuongTrinhDaoTaoHocPhan | null>(null);

  const { data: programs = [] } = useQuery({
    queryKey: ["chuong-trinh-dao-tao"],
    queryFn: listPrograms,
  });

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const programOptions = useMemo(
    () =>
      programs.map((p: ChuongTrinhDaoTao) => ({
        label: `${p.tenTiengViet} (${p.maSoNganh})`,
        value: p.maSoNganh,
      })),
    [programs]
  );

  const hocPhanOptions = useMemo(
    () =>
      hocPhans.map((hp: HocPhan) => ({
        label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
        value: hp.maHocPhan,
      })),
    [hocPhans]
  );

  const { data: cohorts = [] } = useQuery({
    queryKey: ["chuong-trinh-nien-khoa", program],
    queryFn: () => listProgramCohorts(program!),
    enabled: !!program,
  });

  const cohortOptions = useMemo(
    () =>
      cohorts.map((c: ChuongTrinhNienKhoa) => ({
        label: `K${c.khoa}${c.phienBan ? ` — ${c.phienBan}` : ""}`,
        value: c.khoa,
      })),
    [cohorts]
  );

  useEffect(() => {
    if (!program) {
      setKhoa(undefined);
      return;
    }
    if (cohorts.length === 1) {
      setKhoa(cohorts[0].khoa);
    }
  }, [program, cohorts]);

  const queryKey = useMemo(
    () => ["chuong-trinh-dao-tao-hoc-phan", { program, khoa }],
    [program, khoa]
  );

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey,
    enabled: !!program && khoa != null,
    queryFn: () => listProgramCourses(program!, khoa!),
  });

  const rows = useMemo(() => {
    let r = rowsRaw;

    if (hocKyFilter != null) {
      r = r.filter((x) => x.hocKyDuKien === hocKyFilter);
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((x) => {
        const hp = hocPhans.find((h) => h.maHocPhan === x.maHocPhan);
        const tenHp = hp?.tenHocPhan ?? "";
        return (
          x.maHocPhan.toLowerCase().includes(s) ||
          tenHp.toLowerCase().includes(s) ||
          (x.nhomTuChon ?? "").toLowerCase().includes(s) ||
          (x.ghiChu ?? "").toLowerCase().includes(s)
        );
      });
    }

    return r;
  }, [rowsRaw, hocKyFilter, q, hocPhans]);

  const createMut = useMutation({
    mutationFn: async (payload: {
      maSoNganh: string;
      khoa: number;
      data: Omit<ChuongTrinhDaoTaoHocPhan, "maSoNganh">;
    }) => createProgramCourse(payload.maSoNganh, payload.khoa, payload.data),
    onSuccess: async () => {
      message.success("Thêm học phần vào CTĐT thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao-hoc-phan"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: {
      maSoNganh: string;
      khoa: number;
      maHocPhan: string;
      data: Partial<ChuongTrinhDaoTaoHocPhan>;
    }) => updateProgramCourse(payload.maSoNganh, payload.khoa, payload.maHocPhan, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao-hoc-phan"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maSoNganh: string; khoa: number; maHocPhan: string }) =>
      deleteProgramCourse(payload.maSoNganh, payload.khoa, payload.maHocPhan),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao-hoc-phan"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<ChuongTrinhDaoTaoHocPhan> = [
    {
      title: "Học phần",
      dataIndex: "maHocPhan",
      width: 260,
      render: (v) => {
        const hp = hocPhans.find((x) => x.maHocPhan === v);
        return hp ? `${hp.tenHocPhan} (${hp.maHocPhan})` : v;
      },
    },
    {
      title: "Học kỳ dự kiến",
      dataIndex: "hocKyDuKien",
      width: 140,
      render: (v) => (v != null ? <Tag>{`HK${v}`}</Tag> : "-"),
    },
    {
      title: "Năm học dự kiến",
      dataIndex: "namHocDuKien",
      width: 150,
      render: (v) => (v != null ? v : "-"),
    },
    {
      title: "Bắt buộc",
      dataIndex: "batBuoc",
      width: 100,
      render: (v) => (v ? <Tag color="green">Có</Tag> : <Tag color="orange">Không</Tag>),
    },
    {
      title: "Nhóm tự chọn",
      dataIndex: "nhomTuChon",
      width: 130,
      render: (v) => v ?? "-",
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      render: (v) => v ?? "-",
    },
    {
      title: "Hành động",
      key: "actions",
      width: 220,
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
            title="Xóa học phần khỏi CTĐT?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => {
              if (khoa == null) return;
              deleteMut.mutate({
                maSoNganh: row.maSoNganh,
                khoa,
                maHocPhan: row.maHocPhan,
              });
            }}
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
    if (!program || khoa == null) {
      message.warning("Chọn chương trình đào tạo và niên khóa (khóa)");
      return;
    }
    setMode("create");
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      batBuoc: true,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    if (!program) return;

    const v = await form.validateFields();

    const payload: ChuongTrinhDaoTaoHocPhan = {
      maSoNganh: program,
      maHocPhan: v.maHocPhan,
      hocKyDuKien: v.hocKyDuKien ?? null,
      namHocDuKien: v.namHocDuKien ?? null,
      batBuoc: v.batBuoc ?? true,
      nhomTuChon: v.nhomTuChon ?? null,
      ghiChu: v.ghiChu ?? null,
    };

    if (mode === "create") {
      if (khoa == null) return;
      const { maSoNganh, ...data } = payload;
      createMut.mutate({ maSoNganh, khoa, data });
      return;
    }

    if (!editing || khoa == null) return;

    const data: Partial<ChuongTrinhDaoTaoHocPhan> = {
      hocKyDuKien: payload.hocKyDuKien,
      namHocDuKien: payload.namHocDuKien,
      batBuoc: payload.batBuoc,
      nhomTuChon: payload.nhomTuChon,
      ghiChu: payload.ghiChu,
    };

    updateMut.mutate({
      maSoNganh: editing.maSoNganh,
      khoa,
      maHocPhan: editing.maHocPhan,
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
            style={{ width: 360 }}
            placeholder="Chọn chương trình đào tạo"
            options={programOptions}
            value={program}
            onChange={(v) => {
              setProgram(v);
              setKhoa(undefined);
              setQ("");
              setHocKyFilter(undefined);
            }}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 220 }}
            placeholder="Niên khóa (K)"
            options={cohortOptions}
            value={khoa}
            onChange={(v) => setKhoa(v ?? undefined)}
            disabled={!program}
            allowClear={cohorts.length > 1}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 160 }}
            placeholder="Lọc học kỳ"
            allowClear
            value={hocKyFilter}
            onChange={setHocKyFilter}
            options={[
              { label: "HK1", value: 1 },
              { label: "HK2", value: 2 },
              { label: "HK3", value: 3 },
            ]}
          />

          <Input.Search
            placeholder="Tìm học phần / nhóm tự chọn..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!program || khoa == null}
          />
        </Space>

        <Button type="primary" onClick={openCreate} disabled={!program || khoa == null}>
          Thêm học phần vào CTĐT
        </Button>
      </Space>

      <Table
        rowKey={(r) => `${r.maSoNganh}-${r.maHocPhan}`}
        loading={isLoading && !!program && khoa != null}
        columns={columns}
        dataSource={program && khoa != null ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={
          mode === "create"
            ? "Thêm học phần vào chương trình đào tạo"
            : "Sửa học phần trong chương trình đào tạo"
        }
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={760}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Học phần"
            name="maHocPhan"
            rules={[{ required: true, message: "Chọn học phần" }]}
          >
            <Select
              options={hocPhanOptions}
              showSearch
              optionFilterProp="label"
              disabled={mode === "edit"}
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Học kỳ dự kiến" name="hocKyDuKien" style={{ flex: 1 }}>
              <InputNumber min={1} max={12} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Năm học dự kiến" name="namHocDuKien" style={{ flex: 1 }}>
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item label="Nhóm tự chọn" name="nhomTuChon">
            <Input placeholder="VD: Nhóm A" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Bắt buộc" name="batBuoc" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}