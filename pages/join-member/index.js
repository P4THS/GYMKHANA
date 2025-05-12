import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, Container } from "@mui/material";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterCard from '@/components/RegisterCard';

export default function JoinMember() {
  const router = useRouter();
  const [values, setValues] = useState({
    username: "",
    password: "",
    confirm: "",
    showPassword: false,
    showConfirm: false,
    remember: false,
  });

  const handleChange = (prop) => (e) =>
    setValues((v) => ({
      ...v,
      [prop]: prop === "remember" ? e.target.checked : e.target.value,
    }));

  const handleClickShowPassword = () =>
    setValues((v) => ({ ...v, showPassword: !v.showPassword }));

  const handleClickShowConfirm = () =>
    setValues((v) => ({ ...v, showConfirm: !v.showConfirm }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirm } = values;

    // Client‐side checks
    if (!username || !password || !confirm) {
      return alert("All fields are required");
    }
    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    // Call your API
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: username, userPassword: password }),
    });

    if (res.status === 409) {
      return alert("Username already taken");
    }
    if (!res.ok) {
      return alert("Something went wrong");
    }

    // On success, redirect to sign in
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Join as Member — GYM KHANA</title>
      </Head>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          bgcolor: "background.default",
          backgroundImage: 'url("/images/member.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          mt: "-70px",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1,
          },
        }}
      >
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <RegisterCard
            title="Join as Member"
            values={values}
            handleChange={handleChange}
            handleClickShowPassword={handleClickShowPassword}
            handleClickShowConfirm={handleClickShowConfirm}
            handleSubmit={handleSubmit}
          />
        </Container>
      </Box>
      <Footer />
    </>
  );
}

// Pre-render page at build time since no dynamic data needed
export async function getStaticProps() {
  return { props: {} };
}