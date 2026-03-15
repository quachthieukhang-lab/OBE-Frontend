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

type PLO = {
  maPLO: string;
  maSoNganh: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

type CloPloMapping = {
  maCLO: string;
  maPLO: string;
  trongSo: string;
  ghiChu?: string | null;
};

type CloPloMatrixResponse = {
  clos: CLO[];
  plos: PLO[];
  mappings: CloPloMapping[];
};

type MatrixRow = {
  key: string;
  maCLO: string;
  cloCode?: string | null;
  cloText: string;
  [key: string]: string | null | undefined;
};

async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

async function listCloPloMatrix(maHocPhan: string) {
  const res = await http.get<CloPloMatrixResponse>(
    `/hoc-phan/${maHocPhan}/clo-plo-mapping`
  );
  return res.data;
}

async function upsertCloPloMapping(payload: {
  maHocPhan: string;
  maCLO: string;
  maPLO: string;
  trongSo: string;
}) {
  const { maHocPhan, maCLO, maPLO, trongSo } = payload;

  try {
    const res = await http.patch(
      `/hoc-phan/${maHocPhan}/clo/${maCLO}/plo-mapping/${maPLO}`,
      { trongSo }
    );
    return res.data;
  } catch {
    const res = await http.post(
      `/hoc-phan/${maHocPhan}/clo/${maCLO}/plo-mapping`,
      { maPLO, trongSo }
    );
    return res.data;
  }
}

async function deleteCloPloMapping(payload: {
  maHocPhan: string;
  maCLO: string;
  maPLO: string;
}) {
  const { maHocPhan, maCLO, maPLO } = payload;
  await http.delete(`/hoc-phan/${maHocPhan}/clo/${maCLO}/plo-mapping/${maPLO}`);
}

export default function CloPloMatrixPage() {
  const qc = useQueryClient();
  const [maHocPhan, setMaHocPhan] = useState<string>();

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: matrixData, isLoading } = useQuery({
    queryKey: ["clo-plo-mapping", maHocPhan],
    queryFn: () => listCloPloMatrix(maHocPhan!),
    enabled: !!maHocPhan,
  });

  const clos = matrixData?.clos ?? [];
  const plos = matrixData?.plos ?? [];
  const mappings = matrixData?.mappings ?? [];

  const saveMut = useMutation({
    mutationFn: upsertCloPloMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clo-plo-mapping", maHocPhan] });
      message.success("Đã lưu");
    },
    onError: () => message.error("Lưu thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCloPloMapping,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clo-plo-mapping", maHocPhan] });
      message.success("Đã xóa");
    },
    onError: () => message.error("Xóa thất bại"),
  });

  const rows: MatrixRow[] = useMemo(() => {
    return clos.map((clo) => {
      const row: MatrixRow = {
        key: clo.maCLO,
        maCLO: clo.maCLO,
        cloCode: clo.code,
        cloText: clo.noiDungChuanDauRa,
      };

      plos.forEach((plo) => {
        const hit = mappings.find(
          (m) => m.maCLO === clo.maCLO && m.maPLO === plo.maPLO
        );
        row[plo.maPLO] = hit?.trongSo ?? null;
      });

      return row;
    });
  }, [clos, plos, mappings]);

  const columns: ColumnsType<MatrixRow> = useMemo(() => {
    const base: ColumnsType<MatrixRow> = [
      {
        title: "CLO",
        dataIndex: "cloCode",
        width: 100,
        fixed: "left",
        render: (v) => (v ? <Tag>{v}</Tag> : "-"),
      },
      {
        title: "Nội dung CLO",
        dataIndex: "cloText",
        width: 320,
        fixed: "left",
        ellipsis: true,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = plos.map((plo) => ({
      title: plo.code ?? plo.maPLO,
      dataIndex: plo.maPLO,
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
                  maCLO: row.maCLO,
                  maPLO: plo.maPLO,
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
                    maCLO: row.maCLO,
                    maPLO: plo.maPLO,
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
  }, [plos, maHocPhan, saveMut, deleteMut]);

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
        scroll={{ x: 1200 }}
        pagination={false}
        bordered
      />
    </div>
  );
}