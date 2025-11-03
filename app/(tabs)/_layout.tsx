import { Redirect, Slot } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  const isAuthicated = false;

  if(!isAuthicated) return <Redirect href="/sign-in" />
  return (
    <Slot />
  )
}