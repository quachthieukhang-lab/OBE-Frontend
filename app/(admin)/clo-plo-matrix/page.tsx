"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

function buildCellKey(maCLO: string, maPLO: string) {
  return `${maCLO}__${maPLO}`;
}

export default function CloPloMatrixPage() {
  const qc = useQueryClient();
  const [maHocPhan, setMaHocPhan] = useState<string>();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

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
  const initializedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!maHocPhan) {
      setDraftValues({});
      initializedKeyRef.current = null;
      return;
    }

    if (!matrixData) return;

    const mappingsList = matrixData.mappings ?? [];

    const initKey = JSON.stringify(
      mappingsList.map((m) => ({
        maCLO: m.maCLO,
        maPLO: m.maPLO,
        trongSo: String(m.trongSo),
      }))
    );

    if (initializedKeyRef.current === initKey) return;

    const next: Record<string, string> = {};
    mappingsList.forEach((m) => {
      next[buildCellKey(m.maCLO, m.maPLO)] = String(m.trongSo);
    });

    initializedKeyRef.current = initKey;
    setDraftValues(next);
  }, [maHocPhan, matrixData]);

  const rows: MatrixRow[] = useMemo(() => {
    return clos.map((clo) => {
      const row: MatrixRow = {
        key: clo.maCLO,
        maCLO: clo.maCLO,
        cloCode: clo.code,
        cloText: clo.noiDungChuanDauRa,
      };

      plos.forEach((plo) => {
        const key = buildCellKey(clo.maCLO, plo.maPLO);
        row[plo.maPLO] = draftValues[key] ?? null;
      });

      return row;
    });
  }, [clos, plos, draftValues]);

  const getColumnTotal = (maPLO: string) => {
    let total = 0;

    clos.forEach((clo) => {
      const raw = draftValues[buildCellKey(clo.maCLO, maPLO)];
      if (raw != null && raw !== "") {
        total += Number(raw);
      }
    });

    return Number(total.toFixed(4));
  };

  const validateColumnTotals = () => {
    const invalidColumns: Array<{
      maPLO: string;
      label: string;
      total: number;
    }> = [];

    plos.forEach((plo) => {
      const total = getColumnTotal(plo.maPLO);
      if (total !== 0 && total !== 1) {
        invalidColumns.push({
          maPLO: plo.maPLO,
          label: plo.code ?? plo.maPLO,
          total,
        });
      }
    });

    return invalidColumns;
  };

  const saveAllMut = useMutation({
    mutationFn: async () => {
      if (!maHocPhan) return;

      const invalidColumns = validateColumnTotals();
      if (invalidColumns.length > 0) {
        throw new Error(
          invalidColumns.map((c) => `${c.label} = ${c.total}`).join(", ")
        );
      }

      const existingMap = new Map(
        mappings.map((m) => [buildCellKey(m.maCLO, m.maPLO), String(m.trongSo)])
      );

      const allKeys = new Set([
        ...Object.keys(draftValues),
        ...Array.from(existingMap.keys()),
      ]);

      for (const key of allKeys) {
        const [maCLO, maPLO] = key.split("__");
        const nextValue = draftValues[key];
        const oldValue = existingMap.get(key);

        if ((nextValue ?? undefined) === (oldValue ?? undefined)) {
          continue;
        }

        if (nextValue == null || nextValue === "") {
          if (oldValue != null) {
            await deleteCloPloMapping({
              maHocPhan,
              maCLO,
              maPLO,
            });
          }
          continue;
        }

        await upsertCloPloMapping({
          maHocPhan,
          maCLO,
          maPLO,
          trongSo: nextValue,
        });
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clo-plo-mapping", maHocPhan] });
      message.success("Lưu thành công");
    },
    onError: (error: any) => {
      message.error(error?.message ?? "Lưu thất bại");
    },
  });

  const handleSaveAll = () => {
    const invalidColumns = validateColumnTotals();

    if (invalidColumns.length > 0) {
      message.error(
        `Các cột chưa hợp lệ: ${invalidColumns
          .map((c) => `${c.label} = ${c.total}`)
          .join(", ")}`
      );
      return;
    }

    saveAllMut.mutate();
  };

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
        ellipsis: false,
      },
    ];

    const dynamic: ColumnsType<MatrixRow> = plos.map((plo) => ({
      title: (
        <div>
          <div style={{ fontWeight: 600 }}>{plo.code ?? plo.maPLO}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {plo.noiDungChuanDauRa}
          </div>
        </div>
      ),
      dataIndex: plo.maPLO,
      width: 150,
      render: (_value: string | null | undefined, row: MatrixRow) => {
        const key = buildCellKey(row.maCLO, plo.maPLO);
        const raw = draftValues[key];
        const current = raw != null && raw !== "" ? Number(raw) : null;

        return (
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            value={current}
            style={{ width: 100 }}
            onChange={(v) => {
              setDraftValues((prev) => {
                const next = { ...prev };

                if (v === null || v === undefined || v === "") {
                  delete next[key];
                } else {
                  next[key] = String(v);
                }

                return next;
              });
            }}
          />
        );
      },
    }));

    return [...base, ...dynamic];
  }, [plos, draftValues]);

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
          onChange={(value) => {
            initializedKeyRef.current = null;
            setMaHocPhan(value);
          }}
          showSearch
          optionFilterProp="label"
        />

        <Button
          type="primary"
          onClick={handleSaveAll}
          loading={saveAllMut.isPending}
          disabled={!maHocPhan}
        >
          Lưu
        </Button>
      </Space>

      <Table
        rowKey="key"
        loading={isLoading}
        columns={columns}
        dataSource={maHocPhan ? rows : []}
        scroll={{ x: 1400 }}
        pagination={false}
        bordered
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <strong>Tổng cột</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} />
            {plos.map((plo, idx) => {
              const total = getColumnTotal(plo.maPLO);
              const isValid = total === 0 || total === 1;

              return (
                <Table.Summary.Cell key={plo.maPLO} index={idx + 2}>
                  <Tag color={isValid ? "green" : "red"}>{total}</Tag>
                </Table.Summary.Cell>
              );
            })}
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}