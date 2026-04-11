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
  UnorderedListOutlined,
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
  getItem("Dashboard", "/dashboard-admin", <AppstoreOutlined />),
  getItem("Bảng phân tích OBE", "/admin-obe-dashboard",<AppstoreOutlined /> ),
  getItem("Danh mục cơ sở", "sub-master", <ApartmentOutlined />, [
    getItem("Đơn vị", "/don-vi", <ApartmentOutlined />),
    getItem("Niên khóa", "/nien-khoa", <CalendarOutlined />),
    getItem("Giảng viên", "/giang-vien", <TeamOutlined />),
    getItem("Sinh viên", "/sinh-vien", <UserOutlined />),
    getItem("Tài khoản", "/tai-khoan", <UserOutlined />),
  ]),

  getItem("Chương trình đào tạo", "sub-curriculum", <ReadOutlined />, [
    getItem("Chương trình đào tạo", "/chuong-trinh-dao-tao", <ReadOutlined />),
    getItem("CTĐT - Niên khóa", "/chuong-trinh-nien-khoa", <CalendarOutlined />),
    getItem("Học phần", "/hoc-phan", <BookOutlined />),
    getItem("CTĐT - Học phần", "/chuong-trinh-dao-tao-hoc-phan", <BookOutlined />),
    getItem("Cách đánh giá", "/cach-danh-gia", <FileTextOutlined />),
  ]),

  getItem("Vận hành học vụ", "sub-academic", <ScheduleOutlined />, [
    getItem("Lớp học phần", "/lop-hoc-phan", <ScheduleOutlined />),
    getItem("Đăng ký học phần", "/dang-ky-hoc-phan", <FormOutlined />),
    getItem("Phân công đề cương", "/phan-cong-de-cuong", <FileDoneOutlined />),
    getItem("Điểm số", "/diem-so", <BarChartOutlined />),
  ]),

  getItem("Quản lý OBE", "sub-obe", <AimOutlined />, [
    getItem("PLO", "/plo", <AimOutlined />),
    getItem("CLO", "/clo", <FlagOutlined />),
    getItem("CO", "/co", <CheckCircleOutlined />),
    getItem("Ma trận CLO - PLO", "/clo-plo-matrix", <TableOutlined />),
    getItem("Ma trận CO - CLO", "/co-clo-matrix", <TableOutlined />),
    getItem("Ma trận CDG - CO", "/cdg-co-matrix", <TableOutlined />),
    getItem("Cấu hình OBE", "/cau-hinh-obe", <UnorderedListOutlined />),
  ]),
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          OBE Admin
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