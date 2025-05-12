import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';

export async function getStaticProps() {
  return { props: {} };
}

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <Footer/>
    </>
  );
}