"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Button } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  ReadOutlined,
  ApartmentOutlined,
  EditOutlined,
  EyeOutlined,
  ScheduleOutlined,
  UserOutlined,
  FormOutlined,
  AimOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  BarChartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

// Cập nhật hàm getItem để hỗ trợ children (SubMenu)
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return { key, icon, children, label, type } as MenuItem;
}

const MENU: MenuItem[] = [
  getItem("Dashboard", "/dashboard-lecture", <AppstoreOutlined />),

  // getItem("Danh mục cơ sở", "sub-master", <ApartmentOutlined />, [
  //   getItem("Đơn vị", "/don-vi", <ApartmentOutlined />),
  //   getItem("Niên khóa", "/nien-khoa", <CalendarOutlined />),
  //   getItem("Giảng viên", "/giang-vien", <TeamOutlined />),
  //   getItem("Sinh viên", "/sinh-vien", <UserOutlined />),
  // ]),

  // getItem("Chương trình đào tạo", "sub-curriculum", <ReadOutlined />, [
  //   getItem("Chương trình đào tạo", "/chuong-trinh-dao-tao", <ReadOutlined />),
  //   getItem("CTĐT - Niên khóa", "/chuong-trinh-nien-khoa", <CalendarOutlined />),
  //   getItem("Học phần", "/hoc-phan", <BookOutlined />),
  //   getItem("CTĐT - Học phần", "/chuong-trinh-dao-tao-hoc-phan", <BookOutlined />),
  //   getItem("Cách đánh giá", "/cach-danh-gia", <FileTextOutlined />),
  // ]),



  getItem("Đề cương", "sub-de-cuong", <FileTextOutlined />, [
    getItem("Nhập đề cương", "/nhap-de-cuong", <EditOutlined />),
    getItem("Xem đề cương đã nhập", "/de-cuong-lecture", <EyeOutlined />),
  ]),

  getItem("Vận hành học vụ", "sub-academic", <ScheduleOutlined />, [
    getItem("Điểm số phụ trách", "/diem-so-lecture", <BarChartOutlined />),
  ]),

  getItem("Tham khảo OBE", "sub-obe-lecture", <AimOutlined />, [
    getItem("PLO", "/plo-lecture", <AimOutlined />),
    getItem("CLO", "/clo-lecture", <FlagOutlined />),
    getItem("CO", "/co-lecture", <CheckCircleOutlined />),
    getItem("Ma trận CDG - CO", "/cdg-co-matrix-lecture", <TableOutlined />),
    getItem("Ma trận CO - CLO", "/co-clo-matrix-lecture", <TableOutlined />),
    getItem("Ma trận CLO - PLO", "/clo-plo-matrix-lecture", <TableOutlined />),
  ]),
];

export default function LectureLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [manualOpenKeys, setManualOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const flatMenu = useMemo(() => {
    const flat: any[] = [];
    MENU.forEach((m: any) => {
      if (m.children) flat.push(...m.children);
      else flat.push(m);
    });
    return flat;
  }, []);

  const selectedKey = useMemo(() => {
    const hit = flatMenu.find(
      (m) => pathname === m.key || pathname.startsWith(`${m.key}/`)
    );
    return hit ? [String(hit.key)] : [];
  }, [pathname, flatMenu]);

  const routeOpenKeys = useMemo(() => {
    const parent = MENU.find((m: any) =>
      m.children?.some(
        (child: any) => pathname === child.key || pathname.startsWith(`${child.key}/`)
      )
    );
    return parent ? [String((parent as any).key)] : [];
  }, [pathname]);

  useEffect(() => {
    setManualOpenKeys(routeOpenKeys);
  }, [routeOpenKeys]);

  const onClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  if (!mounted) return null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh", // Nên để 100vh thay vì 95vh để layout sidebar tràn viền mượt hơn
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            color: "#fff",
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          OBE Lecture
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={MENU}
          selectedKeys={selectedKey}
          openKeys={manualOpenKeys}
          onOpenChange={(keys) => setManualOpenKeys(keys as string[])}
          onClick={onClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#fff",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 600 }}>Admin</div>
          <Button>Logout</Button>
        </Header>

        <Content style={{ padding: 24, background: "#f5f5f5" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              minHeight: "88vh",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}