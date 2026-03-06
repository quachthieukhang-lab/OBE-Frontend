"use client";

import React, { useMemo, useState } from "react";
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
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function item(label: React.ReactNode, key: string, icon?: React.ReactNode): MenuItem {
    return { key, icon, label } as MenuItem;
}

const MENU: MenuItem[] = [
    item("Dashboard", "/dashboard", <AppstoreOutlined />),
    item("Chương trình đào tạo", "/chuong-trinh-dao-tao", <ReadOutlined />),
    item("CTĐT - Niên khóa", "/chuong-trinh-nien-khoa", <CalendarOutlined />),
    item("Niên khóa", "/nien-khoa", <CalendarOutlined />),
    item("Đơn vị", "/don-vi", <ApartmentOutlined />),
    item("Học phần", "/hoc-phan", <BookOutlined />),
    item("Giảng viên", "/giang-vien", <TeamOutlined />),
    item("Lớp học phần", "/lop-hoc-phan", <ScheduleOutlined />),
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    // match theo prefix để /chuong-trinh-dao-tao/xxx vẫn highlight đúng
    const selectedKey = useMemo(() => {
        const hit = MENU.find((m: any) => pathname === m.key || pathname.startsWith(`${m.key}/`));
        return hit ? [String((hit as any).key)] : [];
    }, [pathname]);

    const onClick: MenuProps["onClick"] = (e) => {
        router.push(e.key);
    };

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
                    height: "100vh",
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
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, minHeight: "88vh" }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}