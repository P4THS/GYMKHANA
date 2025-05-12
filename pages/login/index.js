// pages/login.js
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginCard from '@/components/LoginCard';
import { Box, Container } from '@mui/material';

export default function Login() {
  const router = useRouter();
  const [values, setValues] = useState({
    username: '',
    password: '',
    showPassword: false,
    remember: false,
  });
  const [error, setError] = useState("");

  const handleChange = (prop) => (e) =>
    setValues(v => ({
      ...v,
      [prop]: prop === 'remember' ? e.target.checked : e.target.value,
    }));

  const handleClickShowPassword = () =>
    setValues(v => ({ ...v, showPassword: !v.showPassword }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { username, password } = values;
    if (!username || !password) {
      setError("Both fields are required");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
      // optionally persist session if remember === true
      ...(values.remember && { keepAlive: true }),
    });

    if (res.error) {
      setError(res.error);
    } else {
      // success → push to dashboard or home
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Head>
        <title>Login — GYM KHANA</title>
      </Head>
      <Header />
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: 'url("/images/login.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mt: '-70px',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
            zIndex: 1,
          },
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 2, maxWidth: '400px' }}>
          <LoginCard
            values={values}
            handleChange={handleChange}
            handleClickShowPassword={handleClickShowPassword}
            handleSubmit={handleSubmit}
            error={error}
          />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
