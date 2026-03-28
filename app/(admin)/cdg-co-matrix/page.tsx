"use client";

import { useMemo, useState } from "react";
import { Button, InputNumber, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/http";

type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

type CachDanhGia = {
  maCDG: string;
  maHocPhan: string;
  tenThanhPhan: string;
  cachDanhGia?: string | null;
  trongSo: string;
  loai?: string | null;
};

type CO = {
  maCO: string;
  maHocPhan: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CdgCoMapping = {
  maCDG: string;
  maCO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CdgCoMatrixResponse = {
  cdgs: CachDanhGia[];
  cos: CO[];
  mappings: CdgCoMapping[];
};

type MatrixRow = {
  key: string;
  maCDG: string;
  cdgName: string;
  cdgLoai?: string | null;
  cdgTrongSo: string;
  [key: string]: string | null | undefined;
};

async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

async function listCdgCoMatrix(maHocPhan: string) {
  const res = await http.get<CdgCoMatrixResponse>(
    `/hoc-phan/${maHocPhan}/cdg-co-mapping`
  );
  return res.data;
}

async function upsertCdgCoMapping(payload: {
  maHocPhan: string;
  maCDG: string;
  maCO: string;
  trongSo: string;
}) {
  const { maHocPhan, maCDG, maCO, trongSo } = payload;

  try {
    const res = await http.patch(
      `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping/${maCO}`,
      { trongSo }
    );
    return res.data;
  } catch {
    const res = await http.post(
      `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping`,
      { maCO, trongSo }
    );
    return res.data;
  }
}

async function deleteCdgCoMapping(payload: {
  maHocPhan: string;
  maCDG: string;
  maCO: string;
}) {
  const { maHocPhan, maCDG, maCO } = payload;
  await http.delete(
    `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}/co-mapping/${maCO}`
  );
}

export default function CdgCoMatrixPage() {
  const qc = useQueryClient();
  const [maHocPhan, setMaHocPhan] = useState<string>();

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["cdg-co-mapping", maHocPhan],
    queryFn: () => listCdgCoMatrix(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const cdgs = matrixData?.cdgs ?? [];
  const cos = matrixData?.cos ?? [];
  const mappings = matrixData?.mappings ?? [];

  const saveMut = useMutation({
    mutationFn: upsertCdgCoMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cdg-co-mapping", maHocPhan] });
      message.success("Đã lưu");
    },
    onError: () => message.error("Lưu thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCdgCoMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cdg-co-mapping", maHocPhan] });
      message.success("Đã xóa");
    },
    onError: () => message.error("Xóa thất bại"),
  });

  const rows: MatrixRow[] = useMemo(() => {
    return cdgs.map((cdg) => {
      const row: MatrixRow = {
        key: cdg.maCDG,
        maCDG: cdg.maCDG,
        cdgName: cdg.tenThanhPhan,
        cdgLoai: cdg.loai,
        cdgTrongSo: cdg.trongSo,
      };

      cos.forEach((co) => {
        const hit = mappings.find(
          (m) => m.maCDG === cdg.maCDG && m.maCO === co.maCO
        );
        row[co.maCO] = hit?.trongSo ?? null;
      });

      return row;
    });
  }, [cdgs, cos, mappings]);

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CDG",
        dataIndex: "cdgName",
        width: 220,
        fixed: "left",
      },
      {
        title: "Loại",
        dataIndex: "cdgLoai",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "Trọng số CDG",
        dataIndex: "cdgTrongSo",
        width: 100,
        fixed: "left",
        render: (v) => <Tag color="blue">{v}</Tag>,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = cos.map((co) => ({
      title: co.code ?? co.maCO,
      dataIndex: co.maCO,
      width: 140,
      render: (value: string | null | undefined, row: MatrixRow) => {
        const current = value ? Number(value) : null;

        return (
          <Space orientation="vertical" size={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              value={current}
              style={{ width: 100 }}
              onChange={(v) => {
                if (v === null || v === undefined || !maHocPhan) return;
                saveMut.mutate({
                  maHocPhan,
                  maCDG: row.maCDG,
                  maCO: co.maCO,
                  trongSo: String(v),
                });
              }}
            />
            {value ? (
              <Button
                size="small"
                danger
                onClick={() => {
                  if (!maHocPhan) return;
                  deleteMut.mutate({
                    maHocPhan,
                    maCDG: row.maCDG,
                    maCO: co.maCO,
                  });
                }}
              >
                Xóa
              </Button>
            ) : null}
          </Space>
        );
      },
    }));

    return [...base, ...dynamic];
  }, [cos, maHocPhan, saveMut, deleteMut]);

  const hocPhanOptions = hocPhans.map((hp) => ({
    label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
    value: hp.maHocPhan,
  }));

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 420 }}
          placeholder="Chọn học phần"
          options={hocPhanOptions}
          value={maHocPhan}
          onChange={setMaHocPhan}
          showSearch
          optionFilterProp="label"
        />
      </Space>

      <Table
        rowKey="key"
        loading={isLoading}
        columns={columns}
        dataSource={maHocPhan ? rows : []}
        scroll={{ x: 1400 }}
        pagination={false}
        bordered
      />
    </div>
  );
}