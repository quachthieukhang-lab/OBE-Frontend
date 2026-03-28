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

type CLO = {
  maCLO: string;
  maHocPhan: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CO = {
  maCO: string;
  maHocPhan: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CloCoMapping = {
  maCLO: string;
  maCO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CloCoMatrixResponse = {
  clos: CLO[];
  cos: CO[];
  mappings: CloCoMapping[];
};

type MatrixRow = {
  key: string;
  maCO: string;
  coCode?: string | null;
  coText: string;
  [key: string]: string | null | undefined;
};

async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

async function listCloCoMatrix(maHocPhan: string) {
  const res = await http.get<CloCoMatrixResponse>(
    `/hoc-phan/${maHocPhan}/clo-co-mapping`
  );
  return res.data;
}

async function upsertCloCoMapping(payload: {
  maHocPhan: string;
  maCLO: string;
  maCO: string;
  trongSo: string;
}) {
  const { maHocPhan, maCLO, maCO, trongSo } = payload;

  try {
    const res = await http.patch(
      `/hoc-phan/${maHocPhan}/clo/${maCLO}/co-mapping/${maCO}`,
      { trongSo }
    );
    return res.data;
  } catch {
    const res = await http.post(
      `/hoc-phan/${maHocPhan}/clo/${maCLO}/co-mapping`,
      { maCO, trongSo }
    );
    return res.data;
  }
}

async function deleteCloCoMapping(payload: {
  maHocPhan: string;
  maCLO: string;
  maCO: string;
}) {
  const { maHocPhan, maCLO, maCO } = payload;
  await http.delete(`/hoc-phan/${maHocPhan}/clo/${maCLO}/co-mapping/${maCO}`);
}

export default function CloCoMatrixPage() {
  const qc = useQueryClient();
  const [maHocPhan, setMaHocPhan] = useState<string>();

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["clo-co-mapping", maHocPhan],
    queryFn: () => listCloCoMatrix(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const clos = matrixData?.clos ?? [];
  const cos = matrixData?.cos ?? [];
  const mappings = matrixData?.mappings ?? [];

  const saveMut = useMutation({
    mutationFn: upsertCloCoMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clo-co-mapping", maHocPhan] });
      message.success("Đã lưu");
    },
    onError: () => message.error("Lưu thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCloCoMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clo-co-mapping", maHocPhan] });
      message.success("Đã xóa");
    },
    onError: () => message.error("Xóa thất bại"),
  });

  const rows: MatrixRow[] = useMemo(() => {
    return cos.map((co) => {
      const row: MatrixRow = {
        key: co.maCO,
        maCO: co.maCO,
        coCode: co.code,
        coText: co.noiDungChuanDauRa,
      };

      clos.forEach((clo) => {
        const hit = mappings.find(
          (m) => m.maCO === co.maCO && m.maCLO === clo.maCLO
        );
        row[clo.maCLO] = hit?.trongSo ?? null;
      });

      return row;
    });
  }, [cos, clos, mappings]);

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CO",
        dataIndex: "coCode",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "Nội dung CO",
        dataIndex: "coText",
        width: 320,
        fixed: "left",
        ellipsis: true,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = clos.map((clo) => ({
      title: clo.code ?? clo.maCLO,
      dataIndex: clo.maCLO,
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
                  maCLO: clo.maCLO,
                  maCO: row.maCO,
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
                    maCLO: clo.maCLO,
                    maCO: row.maCO,
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
  }, [clos, maHocPhan, saveMut, deleteMut]);

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