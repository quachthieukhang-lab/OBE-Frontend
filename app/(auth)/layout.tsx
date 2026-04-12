"use client";

import { AimOutlined } from "@ant-design/icons";
import { Col, Grid, Row, Typography } from "antd";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const screens = Grid.useBreakpoint();
  const showMobileBrand = !screens.md;

  return (
    <Row wrap={false} style={{ minHeight: "100vh", margin: 0 }}>
      <Col
        xs={0}
        md={11}
        lg={10}
        style={{
          background:
            "linear-gradient(145deg, #0c4a6e 0%, #1d4ed8 38%, #5b21b6 72%, #4c1d95 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,255,255,0.12) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            top: -80,
            right: -60,
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            bottom: 40,
            left: -60,
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            minHeight: 520,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <AimOutlined style={{ fontSize: 34, color: "#fff" }} />
          </div>
          <Typography.Title
            level={2}
            style={{
              color: "#fff",
              marginBottom: 12,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            OBE System
          </Typography.Title>
          <Typography.Paragraph
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              lineHeight: 1.65,
              maxWidth: 320,
              marginBottom: 36,
            }}
          >
            Quản lý đào tạo theo chuẩn đầu ra — Outcome-Based Education
          </Typography.Paragraph>
          <Row gutter={[12, 12]} justify="center" style={{ maxWidth: 340 }}>
            {[
              { k: "PLO", d: "Chương trình" },
              { k: "CLO", d: "Học phần" },
              { k: "CO", d: "Mục tiêu" },
            ].map((item) => (
              <Col span={8} key={item.k}>
                <div
                  style={{
                    padding: "14px 8px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {item.k}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 11,
                    }}
                  >
                    {item.d}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Col>

      <Col
        xs={24}
        md={13}
        lg={14}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "linear-gradient(180deg, #fafafa 0%, #f0f2f5 100%)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          {showMobileBrand ? (
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <Typography.Title level={4} style={{ margin: 0, color: "#1d4ed8" }}>
                OBE System
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                Outcome-Based Education
              </Typography.Text>
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "center" }}>{children}</div>
        </div>
      </Col>
    </Row>
  );
}
