import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EsnafHomeScreen from '../screens/EsnafHomeScreen';
import MusteriHomeScreen from '../screens/MusteriHomeScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import AddDebtScreen from '../screens/AddDebtScreen';
import InstallmentScreen from '../screens/InstallmentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === 'esnaf' ? (
        // Esnaf Stack
        <>
          <Stack.Screen name="EsnafHome" component={EsnafHomeScreen} />
          <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
          <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
          <Stack.Screen name="AddDebt" component={AddDebtScreen} />
          <Stack.Screen name="Installment" component={InstallmentScreen} />
        </>
      ) : (
        // Müşteri Stack
        <Stack.Screen name="MusteriHome" component={MusteriHomeScreen} />
      )}
    </Stack.Navigator>
  );
}
