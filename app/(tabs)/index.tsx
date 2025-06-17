import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const dashboardData = [
    {
      id: 1,
      title: 'Calendário',
      subtitle: '2 eventos próximos',
      icon: 'calendar-outline',
      color: '#4A90E2',
      borderColor: '#4A90E2',
    },
    {
      id: 2,
      title: 'Tarefas',
      subtitle: '1 pendente',
      icon: 'book-outline',
      color: '#2ECC71',
      borderColor: '#2ECC71',
    },
  ];

  const familyCard = {
    id: 3,
    title: 'Família',
    subtitle: '4 membros',
    icon: 'people-outline',
    color: '#9B59B6',
    borderColor: '#9B59B6',
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Consulta Pediatra - João',
      date: '24/05/2025 às 14:00',
      color: '#4A90E2',
    },
    {
      id: 2,
      title: 'Prova de Matemática - Ana',
      date: '26/05/2025 às 08:00',
      color: '#4A90E2',
    },
  ];

  const handleCardPress = (cardTitle: string) => {
    // Navegação será implementada com as outras telas
    console.log(`Navegando para ${cardTitle}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>CommiTime</Text>
        <Text style={styles.subtitle}>Organização familiar simplificada</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dashboard Cards */}
        <View style={styles.dashboardContainer}>
          {/* Primeira linha - Calendário e Tarefas */}
          <View style={styles.topRow}>
            {dashboardData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dashboardCard,
                  { borderLeftColor: item.borderColor }
                ]}
                onPress={() => handleCardPress(item.title)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Segunda linha - Família (card único) */}
          <TouchableOpacity
            style={[
              styles.dashboardCard,
              styles.familyCard,
              { borderLeftColor: familyCard.borderColor }
            ]}
            onPress={() => handleCardPress(familyCard.title)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name={familyCard.icon as any}
                  size={24}
                  color={familyCard.color}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{familyCard.title}</Text>
                <Text style={styles.cardSubtitle}>{familyCard.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Próximos Eventos */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          
          {upcomingEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => handleCardPress('Calendário')}
              activeOpacity={0.8}
            >
              <View style={[styles.eventIndicator, { backgroundColor: event.color }]} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dashboardContainer: {
    marginBottom: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    width: '48%',
  },
  familyCard: {
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  eventsSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
  },
  eventIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6C757D',
  },
});