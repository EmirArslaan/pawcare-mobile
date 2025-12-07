// App.js - Full app with all screens
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Constants
const API_BASE_URL = 'http://localhost:5001/api';
const COLORS = {
  primary: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' },
  secondary: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7' },
  danger: '#ef4444',
  accent: '#f59e0b',
  gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
  white: '#ffffff',
};

// Auth Store (simplified inline)
let authState = { user: null, token: null };
const STORAGE_KEY = 'pawCareUser';

const loadAuth = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      authState = JSON.parse(stored);
    }
  } catch (e) {
    console.log('Auth load error:', e);
  }
};

const saveAuth = async (data) => {
  authState = data;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const clearAuth = async () => {
  authState = { user: null, token: null };
  await AsyncStorage.removeItem(STORAGE_KEY);
};

// API client
const apiClient = axios.create({ baseURL: API_BASE_URL });
apiClient.interceptors.request.use((config) => {
  if (authState.token) {
    config.headers.Authorization = `Bearer ${authState.token}`;
  }
  return config;
});

// ============ SCREENS ============

// Home Screen
function HomeScreen({ navigation }) {
  const [adoptions, setAdoptions] = useState([]);
  const [lostPets, setLostPets] = useState([]);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [adoptRes, lostRes, forumRes] = await Promise.all([
        apiClient.get('/adoption?limit=3'),
        apiClient.get('/lostpets?limit=3'),
        apiClient.get('/forum?limit=3'),
      ]);
      setAdoptions(adoptRes.data);
      setLostPets(lostRes.data);
      setForums(forumRes.data);
    } catch (e) {
      console.log('Home data error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🐾</Text>
        <Text style={styles.heroTitle}>PawCare</Text>
        <Text style={styles.heroSubtitle}>Sokak Hayvanları İçin</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: COLORS.primary[500] }]} onPress={() => navigation.navigate('AdoptionTab')}>
          <Text style={styles.quickActionEmoji}>🐕</Text>
          <Text style={styles.quickActionText}>Sahiplen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: COLORS.danger }]} onPress={() => navigation.navigate('MapTab')}>
          <Text style={styles.quickActionEmoji}>🚨</Text>
          <Text style={styles.quickActionText}>Kayıp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: COLORS.secondary[500] }]} onPress={() => navigation.navigate('MapTab')}>
          <Text style={styles.quickActionEmoji}>🗺️</Text>
          <Text style={styles.quickActionText}>Harita</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Adoptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐾 Son Sahiplendirmeler</Text>
        {adoptions.length === 0 ? (
          <Text style={styles.emptyText}>Henüz ilan yok</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {adoptions.map((item) => (
              <TouchableOpacity key={item._id} style={styles.smallCard}>
                {item.imageUrls?.[0] && <Image source={{ uri: item.imageUrls[0] }} style={styles.smallCardImage} />}
                <Text style={styles.smallCardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.smallCardSub}>{item.locationString}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Latest Lost Pets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Kayıp İlanları</Text>
        {lostPets.length === 0 ? (
          <Text style={styles.emptyText}>Henüz ilan yok</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {lostPets.map((item) => (
              <TouchableOpacity key={item._id} style={[styles.smallCard, { borderColor: COLORS.danger, borderWidth: 2 }]}>
                {item.imageUrls?.[0] && <Image source={{ uri: item.imageUrls[0] }} style={styles.smallCardImage} />}
                <Text style={styles.smallCardTitle} numberOfLines={1}>{item.petName}</Text>
                <Text style={styles.smallCardSub}>{item.locationString}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Latest Forum Posts */}
      <View style={[styles.section, { marginBottom: 32 }]}>
        <Text style={styles.sectionTitle}>💬 Forum</Text>
        {forums.length === 0 ? (
          <Text style={styles.emptyText}>Henüz konu yok</Text>
        ) : (
          forums.map((post) => (
            <TouchableOpacity key={post._id} style={styles.forumCard} onPress={() => navigation.navigate('ForumTab')}>
              <Text style={styles.forumTitle} numberOfLines={1}>{post.title}</Text>
              <Text style={styles.forumMeta}>{post.user?.username} • {post.comments?.length || 0} yorum</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Adoption List Screen
function AdoptionScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await apiClient.get('/adoption');
      setListings(res.data);
    } catch (e) {
      console.log('Adoption fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchListings();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary[500]} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={styles.headerTitle}>🐾 Sahiplendirme</Text>
        {authState.user && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateAdoption')}
          >
            <Text style={styles.addButtonText}>+ İlan Ver</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listingCard}
            onPress={() => navigation.navigate('AdoptionDetail', { id: item._id })}
          >
            {item.imageUrls?.[0] && <Image source={{ uri: item.imageUrls[0] }} style={styles.listingImage} />}
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle}>{item.title}</Text>
              <Text style={styles.listingLocation}>📍 {item.locationString}</Text>
              <View style={styles.listingTags}>
                <Text style={styles.tag}>{item.age || 'Yaş belirtilmedi'}</Text>
                <Text style={styles.tag}>{item.gender === 'male' ? '♂️ Erkek' : '♀️ Dişi'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz ilan yok</Text>}
      />
    </View>
  );
}

// Lost Pets Screen
function LostPetsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await apiClient.get('/lostpets');
      setListings(res.data);
    } catch (e) {
      console.log('Lost pets fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchListings();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.danger} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: COLORS.danger }]}>
        <Text style={[styles.headerTitle, { color: COLORS.danger }]}>🚨 Kayıp İlanları</Text>
        {authState.user && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: COLORS.danger }]}
            onPress={() => navigation.navigate('CreateLostPet')}
          >
            <Text style={styles.addButtonText}>+ İlan Ver</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listingCard, { borderLeftWidth: 4, borderLeftColor: COLORS.danger }]}
            onPress={() => navigation.navigate('LostPetDetail', { id: item._id })}
          >
            {item.imageUrls?.[0] && <Image source={{ uri: item.imageUrls[0] }} style={styles.listingImage} />}
            <View style={styles.listingInfo}>
              <Text style={[styles.listingTitle, { color: COLORS.danger }]}>KAYIP: {item.petName}</Text>
              <Text style={styles.listingLocation}>📍 {item.locationString}</Text>
              <View style={styles.listingTags}>
                <Text style={[styles.tag, { backgroundColor: COLORS.danger + '20', color: COLORS.danger }]}>
                  {new Date(item.lostDate).toLocaleDateString('tr-TR')}
                </Text>
                <Text style={styles.tag}>
                  {item.animalType === 'dog' ? '🐕 Köpek' : item.animalType === 'cat' ? '🐈 Kedi' : '🐾 Diğer'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz kayıp ilanı yok</Text>}
      />
    </View>
  );
}

// Map Screen with Add Point Modal
function MapScreen() {
  const [feeds, setFeeds] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [newPoint, setNewPoint] = useState({
    type: 'feed',
    status: 'food_provided',
    notes: '',
    description: '',
    imageUri: null,
  });

  const fetchData = async () => {
    try {
      const [feedsRes, sheltersRes, emergencyRes] = await Promise.all([
        apiClient.get('/feeds'),
        apiClient.get('/shelters'),
        apiClient.get('/emergency'),
      ]);
      setFeeds(feedsRes.data);
      setShelters(sheltersRes.data);
      setEmergencies(emergencyRes.data);
    } catch (e) {
      console.log('Map data error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch (e) {
      console.log('Location error:', e);
    }
  };

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const getPoints = () => {
    let points = [];
    if (filter === 'all' || filter === 'feeds') {
      feeds.forEach(f => points.push({ ...f, type: 'feed', emoji: f.status === 'food_provided' ? '🥣' : '🫙', label: f.status === 'food_provided' ? 'Mama Bırakıldı' : 'Mama Gerekli' }));
    }
    if (filter === 'all' || filter === 'shelters') {
      shelters.forEach(s => points.push({ ...s, type: 'shelter', emoji: '🏠', label: 'Barınak' }));
    }
    if (filter === 'all' || filter === 'emergency') {
      emergencies.forEach(e => points.push({ ...e, type: 'emergency', emoji: '🚨', label: 'Acil Durum' }));
    }
    return points;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setNewPoint({ ...newPoint, imageUri: result.assets[0].uri });
    }
  };

  const handleAddPoint = async () => {
    if (!newPoint.imageUri) {
      Alert.alert('Hata', 'Lütfen bir fotoğraf ekleyin.');
      return;
    }
    if (!userLocation) {
      Alert.alert('Hata', 'Konum alınamadı. Lütfen konum izni verin.');
      return;
    }
    try {
      setSubmitting(true);
      // Upload image
      const formData = new FormData();
      formData.append('image', { uri: newPoint.imageUri, type: 'image/jpeg', name: 'photo.jpg' });
      const uploadRes = await apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data.imageUrl;
      // Create point
      const pointData = {
        location: { type: 'Point', coordinates: [userLocation.lng, userLocation.lat] },
        imageUrl,
      };
      if (newPoint.type === 'feed') {
        await apiClient.post('/feeds', { ...pointData, status: newPoint.status, notes: newPoint.notes });
      } else if (newPoint.type === 'shelter') {
        await apiClient.post('/shelters', { ...pointData, description: newPoint.description });
      } else {
        await apiClient.post('/emergency', { ...pointData, description: newPoint.description });
      }
      Alert.alert('Başarılı', 'Nokta eklendi!');
      setModalVisible(false);
      setNewPoint({ type: 'feed', status: 'food_provided', notes: '', description: '', imageUri: null });
      fetchData();
    } catch (e) {
      console.log('Add point error:', e);
      Alert.alert('Hata', 'Nokta eklenemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary[500]} /></View>;
  }

  const points = getPoints();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Harita Noktaları</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {['all', 'feeds', 'shelters', 'emergency'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterChipText, filter === f && { color: COLORS.white }]}>
              {f === 'all' ? 'Tümü' : f === 'feeds' ? '🥣' : f === 'shelters' ? '🏠' : '🚨'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>🥣 {feeds.length}  •  🏠 {shelters.length}  •  🚨 {emergencies.length}</Text>
      </View>

      {/* Add Button - Below Stats */}
      {authState.user && (
        <TouchableOpacity
          style={{ backgroundColor: COLORS.primary[500], marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 10, alignItems: 'center' }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '600' }}>+ Yeni Nokta Ekle</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={points}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.pointCard, item.type === 'emergency' && { borderLeftWidth: 4, borderLeftColor: COLORS.danger }]}
            onPress={() => {
              const lat = item.location?.coordinates?.[1];
              const lng = item.location?.coordinates?.[0];
              if (lat && lng) Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
            }}
          >
            <Text style={styles.pointEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointLabel}>{item.label}</Text>
              <Text style={styles.pointUser}>{item.user?.username || 'Bilinmiyor'}</Text>
            </View>
            <Text style={styles.mapLink}>📍</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Bu kategoride nokta yok</Text>}
      />

      {/* Add Point Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📍 Yeni Nokta Ekle</Text>
            <Text style={styles.modalSubtitle}>Mevcut konumunuz kullanılacak</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selection */}
              <Text style={styles.modalLabel}>Tür</Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity style={[styles.pickerItem, newPoint.type === 'feed' && styles.pickerItemActive]} onPress={() => setNewPoint({ ...newPoint, type: 'feed' })}>
                  <Text>🥣 Besleme</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pickerItem, newPoint.type === 'shelter' && styles.pickerItemActive]} onPress={() => setNewPoint({ ...newPoint, type: 'shelter' })}>
                  <Text>🏠 Barınak</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pickerItem, newPoint.type === 'emergency' && styles.pickerItemActive]} onPress={() => setNewPoint({ ...newPoint, type: 'emergency' })}>
                  <Text>🚨 Acil</Text>
                </TouchableOpacity>
              </View>

              {/* Status for Feed */}
              {newPoint.type === 'feed' && (
                <>
                  <Text style={styles.modalLabel}>Durum</Text>
                  <View style={styles.pickerRow}>
                    <TouchableOpacity style={[styles.pickerItem, newPoint.status === 'food_provided' && styles.pickerItemActive]} onPress={() => setNewPoint({ ...newPoint, status: 'food_provided' })}>
                      <Text>✓ Mama Bırakıldı</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.pickerItem, newPoint.status === 'needs_food' && styles.pickerItemActive]} onPress={() => setNewPoint({ ...newPoint, status: 'needs_food' })}>
                      <Text>! Mama Gerekli</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput style={styles.input} placeholder="Not (opsiyonel)" placeholderTextColor={COLORS.gray[400]} value={newPoint.notes} onChangeText={(t) => setNewPoint({ ...newPoint, notes: t })} />
                </>
              )}

              {/* Description for Shelter/Emergency */}
              {(newPoint.type === 'shelter' || newPoint.type === 'emergency') && (
                <>
                  <Text style={styles.modalLabel}>Açıklama</Text>
                  <TextInput style={[styles.input, { height: 80 }]} placeholder="Açıklama yazın..." placeholderTextColor={COLORS.gray[400]} value={newPoint.description} onChangeText={(t) => setNewPoint({ ...newPoint, description: t })} multiline />
                </>
              )}

              {/* Image */}
              <Text style={styles.modalLabel}>Fotoğraf *</Text>
              {newPoint.imageUri ? (
                <View style={{ alignItems: 'flex-start' }}>
                  <Image source={{ uri: newPoint.imageUri }} style={styles.previewImage} />
                  <TouchableOpacity onPress={() => setNewPoint({ ...newPoint, imageUri: null })}>
                    <Text style={{ color: COLORS.danger, marginTop: 4 }}>Kaldır</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Text style={styles.imagePickerText}>📷 Fotoğraf Seç</Text>
                </TouchableOpacity>
              )}

              {/* Actions */}
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginRight: 8, backgroundColor: COLORS.gray[300] }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.primaryButtonText, { color: COLORS.gray[700] }]}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleAddPoint} disabled={submitting}>
                  <Text style={styles.primaryButtonText}>{submitting ? 'Ekleniyor...' : 'Ekle'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Forum Screen
function ForumScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/forum');
      setPosts(res.data);
    } catch (e) {
      console.log('Forum fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary[500]} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Forum</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.forumCard}>
            <View style={styles.forumCategory}>
              <Text style={styles.forumCategoryText}>
                {item.category === 'health' ? '🏥 Sağlık' : item.category === 'food' ? '🍖 Beslenme' : '💭 Genel'}
              </Text>
            </View>
            <Text style={styles.forumTitle}>{item.title}</Text>
            <Text style={styles.forumMeta}>{item.user?.username} • {item.comments?.length || 0} yorum</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz konu yok</Text>}
      />
    </View>
  );
}

// Profile Screen
function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(authState.user);

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış', style: 'destructive', onPress: async () => {
          await clearAuth();
          setUser(null);
        }
      }
    ]);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🔒</Text>
        <Text style={styles.headerTitle}>Giriş Yapın</Text>
        <Text style={{ color: COLORS.gray[500], marginBottom: 24 }}>Profilinizi görüntülemek için giriş yapın</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

// Login Screen
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gerekli');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      await saveAuth({ user: res.data.user, token: res.data.token });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Hata', 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🐾</Text>
      <Text style={styles.authTitle}>PawCare Giriş</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={COLORS.gray[400]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor={COLORS.gray[400]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Hesabınız yok mu? Kayıt olun</Text>
      </TouchableOpacity>
    </View>
  );
}

// Register Screen
function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Tüm alanlar gerekli');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/auth/register', { username, email, password });
      Alert.alert('Başarılı', 'Kayıt tamamlandı!', [
        { text: 'Tamam', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      Alert.alert('Hata', 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🐾</Text>
      <Text style={styles.authTitle}>PawCare Kayıt</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor={COLORS.gray[400]}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        placeholderTextColor={COLORS.gray[400]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor={COLORS.gray[400]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </TouchableOpacity>
    </View>
  );
}

// Adoption Detail Screen
function AdoptionDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/adoption/${id}`)
      .then(res => setListing(res.data))
      .catch(e => console.log('Fetch error:', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary[500]} /></View>;
  if (!listing) return <View style={styles.center}><Text>İlan bulunamadı</Text></View>;

  const handleContact = () => {
    if (listing.user?.email) {
      Linking.openURL(`mailto:${listing.user.email}?subject=PawCare: ${listing.title}`);
    } else {
      Alert.alert('Bilgi', 'İletişim bilgisi bulunamadı');
    }
  };

  const handleDelete = () => {
    Alert.alert('Sil', 'Bu ilanı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/adoption/${id}`);
            Alert.alert('Başarılı', 'İlan silindi');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Hata', 'Silinemedi');
          }
        }
      }
    ]);
  };

  const isOwner = authState.user?._id === listing.user?._id;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>
      {listing.imageUrls?.[0] && <Image source={{ uri: listing.imageUrls[0] }} style={styles.detailImage} />}
      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{listing.title}</Text>
        <Text style={styles.detailLocation}>📍 {listing.locationString}</Text>
        <View style={styles.detailTags}>
          <Text style={styles.detailTag}>{listing.age || 'Yaş belirtilmedi'}</Text>
          <Text style={styles.detailTag}>{listing.gender === 'male' ? '♂️ Erkek' : '♀️ Dişi'}</Text>
          <Text style={styles.detailTag}>{listing.animalType === 'dog' ? '🐕 Köpek' : listing.animalType === 'cat' ? '🐈 Kedi' : '🐾 Diğer'}</Text>
        </View>
        <Text style={styles.detailDesc}>{listing.description}</Text>
        <View style={styles.ownerBox}>
          <Text style={styles.ownerLabel}>İlan Sahibi:</Text>
          <Text style={styles.ownerName}>{listing.user?.username}</Text>
        </View>
        {isOwner ? (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.danger }]} onPress={handleDelete}>
            <Text style={styles.primaryButtonText}>🗑 İlanı Sil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleContact}>
            <Text style={styles.primaryButtonText}>📧 İletişime Geç</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// Create Adoption Screen
function CreateAdoptionScreen({ navigation }) {
  const [form, setForm] = useState({ title: '', description: '', animalType: 'dog', age: '', gender: 'male', locationString: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      setImages(result.assets.map(a => a.uri));
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.locationString || images.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve fotoğraf ekleyin');
      return;
    }
    try {
      setLoading(true);
      const imageUrls = [];
      for (const uri of images) {
        const formData = new FormData();
        formData.append('image', { uri, type: 'image/jpeg', name: 'photo.jpg' });
        const uploadRes = await apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrls.push(uploadRes.data.imageUrl);
      }
      await apiClient.post('/adoption', { ...form, imageUrls });
      Alert.alert('Başarılı', 'İlan oluşturuldu!');
      navigation.goBack();
    } catch (e) {
      console.log('Create error:', e);
      Alert.alert('Hata', 'İlan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← İptal</Text>
      </TouchableOpacity>
      <Text style={styles.formTitle}>🐾 Yeni Sahiplendirme İlanı</Text>
      <TextInput style={styles.input} placeholder="Başlık" value={form.title} onChangeText={v => setForm({ ...form, title: v })} placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Açıklama" value={form.description} onChangeText={v => setForm({ ...form, description: v })} multiline placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={styles.input} placeholder="Konum (Şehir, İlçe)" value={form.locationString} onChangeText={v => setForm({ ...form, locationString: v })} placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={styles.input} placeholder="Yaş (örn: 2 yaş)" value={form.age} onChangeText={v => setForm({ ...form, age: v })} placeholderTextColor={COLORS.gray[400]} />
      <View style={styles.pickerRow}>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'dog' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'dog' })}><Text>🐕 Köpek</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'cat' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'cat' })}><Text>🐈 Kedi</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'other' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'other' })}><Text>🐾 Diğer</Text></TouchableOpacity>
      </View>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={[styles.pickerItem, form.gender === 'male' && styles.pickerItemActive]} onPress={() => setForm({ ...form, gender: 'male' })}><Text>♂️ Erkek</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.pickerItem, form.gender === 'female' && styles.pickerItemActive]} onPress={() => setForm({ ...form, gender: 'female' })}><Text>♀️ Dişi</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
        <Text style={styles.imagePickerText}>📷 Fotoğraf Seç ({images.length})</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={{ marginVertical: 8 }}>
        {images.map((uri, i) => <Image key={i} source={{ uri }} style={styles.previewImage} />)}
      </ScrollView>
      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Oluşturuluyor...' : 'İlan Oluştur'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Lost Pet Detail Screen
function LostPetDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/lostpets/${id}`)
      .then(res => setListing(res.data))
      .catch(e => console.log('Fetch error:', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.danger} /></View>;
  if (!listing) return <View style={styles.center}><Text>İlan bulunamadı</Text></View>;

  const handleCall = () => {
    if (listing.contactInfo) Linking.openURL(`tel:${listing.contactInfo}`);
  };

  const handleDelete = () => {
    Alert.alert('Sil', 'Bu ilanı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await apiClient.delete(`/lostpets/${id}`);
            Alert.alert('Başarılı', 'İlan silindi');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Hata', 'Silinemedi');
          }
        }
      }
    ]);
  };

  const isOwner = authState.user?._id === listing.user?._id;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>
      <View style={styles.alertBanner}>
        <Text style={styles.alertBannerText}>🚨 KAYIP HAYVAN 🚨</Text>
      </View>
      {listing.imageUrls?.[0] && <Image source={{ uri: listing.imageUrls[0] }} style={styles.detailImage} />}
      <View style={styles.detailContent}>
        <Text style={[styles.detailTitle, { color: COLORS.danger }]}>{listing.petName}</Text>
        <Text style={styles.detailLocation}>📍 Son görüldüğü yer: {listing.locationString}</Text>
        <Text style={styles.detailLocation}>📅 Kaybolma tarihi: {new Date(listing.lostDate).toLocaleDateString('tr-TR')}</Text>
        <View style={styles.detailTags}>
          <Text style={[styles.detailTag, { backgroundColor: COLORS.danger + '20', color: COLORS.danger }]}>
            {listing.animalType === 'dog' ? '🐕 Köpek' : listing.animalType === 'cat' ? '🐈 Kedi' : '🐾 Diğer'}
          </Text>
        </View>
        <Text style={styles.detailDesc}>{listing.description}</Text>
        {listing.contactInfo && (
          <View style={styles.contactBox}>
            <Text style={styles.contactLabel}>📞 İletişim:</Text>
            <Text style={styles.contactNumber}>{listing.contactInfo}</Text>
          </View>
        )}
        {isOwner ? (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.danger }]} onPress={handleDelete}>
            <Text style={styles.primaryButtonText}>🗑 İlanı Sil</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.danger }]} onPress={handleCall}>
            <Text style={styles.primaryButtonText}>📞 Hemen Ara</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// Create Lost Pet Screen
function CreateLostPetScreen({ navigation }) {
  const [form, setForm] = useState({ petName: '', description: '', animalType: 'dog', locationString: '', lostDate: '', contactInfo: '' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) {
      setImages(result.assets.map(a => a.uri));
    }
  };

  const handleSubmit = async () => {
    if (!form.petName || !form.description || !form.locationString || !form.contactInfo || images.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve fotoğraf ekleyin');
      return;
    }
    try {
      setLoading(true);
      const imageUrls = [];
      for (const uri of images) {
        const formData = new FormData();
        formData.append('image', { uri, type: 'image/jpeg', name: 'photo.jpg' });
        const uploadRes = await apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrls.push(uploadRes.data.imageUrl);
      }
      // Use current date if not specified
      const lostDate = form.lostDate || new Date().toISOString().split('T')[0];
      await apiClient.post('/lostpets', { ...form, lostDate, imageUrls });
      Alert.alert('Başarılı', 'Kayıp ilanı oluşturuldu!');
      navigation.goBack();
    } catch (e) {
      console.log('Create lost pet error:', e);
      Alert.alert('Hata', 'İlan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← İptal</Text>
      </TouchableOpacity>
      <Text style={[styles.formTitle, { color: COLORS.danger }]}>🚨 Kayıp Hayvan İlanı</Text>
      <TextInput style={styles.input} placeholder="Hayvanın Adı" value={form.petName} onChangeText={v => setForm({ ...form, petName: v })} placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Açıklama (özellikleri, rengi vb.)" value={form.description} onChangeText={v => setForm({ ...form, description: v })} multiline placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={styles.input} placeholder="Son görüldüğü konum" value={form.locationString} onChangeText={v => setForm({ ...form, locationString: v })} placeholderTextColor={COLORS.gray[400]} />
      <TextInput style={styles.input} placeholder="Telefon numaranız" value={form.contactInfo} onChangeText={v => setForm({ ...form, contactInfo: v })} keyboardType="phone-pad" placeholderTextColor={COLORS.gray[400]} />
      <View style={styles.pickerRow}>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'dog' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'dog' })}><Text>🐕 Köpek</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'cat' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'cat' })}><Text>🐈 Kedi</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.pickerItem, form.animalType === 'other' && styles.pickerItemActive]} onPress={() => setForm({ ...form, animalType: 'other' })}><Text>🐾 Diğer</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
        <Text style={styles.imagePickerText}>📷 Fotoğraf Seç ({images.length})</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={{ marginVertical: 8 }}>
        {images.map((uri, i) => <Image key={i} source={{ uri }} style={styles.previewImage} />)}
      </ScrollView>
      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.danger }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Oluşturuluyor...' : 'Kayıp İlanı Oluştur'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ============ NAVIGATION ============

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Ana Sayfa', tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tab.Screen name="AdoptionTab" component={AdoptionScreen} options={{ tabBarLabel: 'Sahiplen', tabBarIcon: () => <TabIcon emoji="🐾" /> }} />
      <Tab.Screen name="LostTab" component={LostPetsScreen} options={{ tabBarLabel: 'Kayıp', tabBarIcon: () => <TabIcon emoji="🚨" /> }} />
      <Tab.Screen name="MapTab" component={MapScreen} options={{ tabBarLabel: 'Harita', tabBarIcon: () => <TabIcon emoji="🗺️" /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profil', tabBarIcon: () => <TabIcon emoji="👤" /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAuth().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={{ marginTop: 16, color: COLORS.primary[500] }}>PawCare Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AdoptionDetail" component={AdoptionDetailScreen} />
        <Stack.Screen name="CreateAdoption" component={CreateAdoptionScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="LostPetDetail" component={LostPetDetailScreen} />
        <Stack.Screen name="CreateLostPet" component={CreateLostPetScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[100] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray[100] },

  // Header
  header: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray[900] },

  // Hero
  hero: { backgroundColor: COLORS.primary[500], padding: 32, alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  heroSubtitle: { fontSize: 16, color: COLORS.primary[100] },

  // Quick Actions
  quickActions: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  quickAction: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  quickActionEmoji: { fontSize: 28, marginBottom: 4 },
  quickActionText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },

  // Section
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.gray[900], marginBottom: 12 },

  // Small Card
  smallCard: { width: 140, backgroundColor: COLORS.white, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  smallCardImage: { width: 140, height: 100, backgroundColor: COLORS.gray[200] },
  smallCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.gray[900], paddingHorizontal: 10, paddingTop: 8 },
  smallCardSub: { fontSize: 12, color: COLORS.gray[500], paddingHorizontal: 10, paddingBottom: 10 },

  // Listing Card
  listingCard: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  listingImage: { width: 100, height: 100, backgroundColor: COLORS.gray[200] },
  listingInfo: { flex: 1, padding: 12 },
  listingTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900], marginBottom: 4 },
  listingLocation: { fontSize: 13, color: COLORS.gray[500], marginBottom: 8 },
  listingTags: { flexDirection: 'row' },
  tag: { backgroundColor: COLORS.primary[50], color: COLORS.primary[600], fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },

  // Forum Card
  forumCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10 },
  forumCategory: { alignSelf: 'flex-start', backgroundColor: COLORS.accent + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  forumCategoryText: { fontSize: 12, color: COLORS.accent },
  forumTitle: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900], marginBottom: 4 },
  forumMeta: { fontSize: 12, color: COLORS.gray[500] },

  // Map/Points
  filters: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.white },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.gray[200], marginHorizontal: 4 },
  filterChipActive: { backgroundColor: COLORS.primary[500] },
  filterChipText: { fontSize: 14, color: COLORS.gray[700] },
  stats: { backgroundColor: COLORS.primary[50], paddingVertical: 8, paddingHorizontal: 16 },
  statsText: { fontSize: 13, color: COLORS.primary[600], textAlign: 'center' },
  pointCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10 },
  pointEmoji: { fontSize: 28, marginRight: 12 },
  pointLabel: { fontSize: 14, fontWeight: '600', color: COLORS.gray[900] },
  pointUser: { fontSize: 12, color: COLORS.gray[500] },
  mapLink: { fontSize: 20 },

  // Profile
  profileHeader: { backgroundColor: COLORS.primary[500], padding: 32, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.primary[500] },
  username: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  email: { fontSize: 14, color: COLORS.primary[100] },
  logoutButton: { margin: 16, padding: 16, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
  logoutButtonText: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },

  // Auth
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.gray[100] },
  authTitle: { fontSize: 24, fontWeight: '700', color: COLORS.gray[900], marginBottom: 24 },
  input: { width: '100%', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[300], borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 12, color: COLORS.gray[900] },
  primaryButton: { width: '100%', backgroundColor: COLORS.primary[500], padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  linkText: { color: COLORS.primary[500], marginTop: 16, fontSize: 14 },

  // Empty
  emptyText: { textAlign: 'center', color: COLORS.gray[500], paddingVertical: 24 },

  // Add Button
  addButton: { backgroundColor: COLORS.primary[500], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },

  // Back Button
  backButton: { padding: 16, paddingTop: 50 },
  backButtonText: { fontSize: 16, color: COLORS.primary[500], fontWeight: '600' },

  // Detail Screen
  detailImage: { width: '100%', height: 250, backgroundColor: COLORS.gray[200] },
  detailContent: { padding: 16 },
  detailTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gray[900], marginBottom: 8 },
  detailLocation: { fontSize: 14, color: COLORS.gray[600], marginBottom: 8 },
  detailTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  detailTag: { backgroundColor: COLORS.primary[100], color: COLORS.primary[600], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8, fontSize: 13 },
  detailDesc: { fontSize: 15, color: COLORS.gray[700], lineHeight: 22, marginBottom: 16 },
  ownerBox: { backgroundColor: COLORS.gray[50], padding: 12, borderRadius: 8, marginBottom: 16 },
  ownerLabel: { fontSize: 12, color: COLORS.gray[500] },
  ownerName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[900] },
  contactBox: { backgroundColor: COLORS.danger + '10', padding: 12, borderRadius: 8, marginBottom: 16 },
  contactLabel: { fontSize: 12, color: COLORS.danger },
  contactNumber: { fontSize: 18, fontWeight: '700', color: COLORS.danger },

  // Alert Banner
  alertBanner: { backgroundColor: COLORS.danger, padding: 12, alignItems: 'center' },
  alertBannerText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  // Form
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.gray[900], marginBottom: 20, marginTop: 8 },
  pickerRow: { flexDirection: 'row', marginBottom: 12 },
  pickerItem: { flex: 1, padding: 12, backgroundColor: COLORS.gray[100], borderRadius: 8, alignItems: 'center', marginRight: 8 },
  pickerItemActive: { backgroundColor: COLORS.primary[100], borderWidth: 1, borderColor: COLORS.primary[500] },
  imagePickerButton: { backgroundColor: COLORS.gray[200], padding: 20, borderRadius: 8, alignItems: 'center', marginVertical: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.gray[400] },
  imagePickerText: { fontSize: 15, color: COLORS.gray[600] },
  previewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gray[900], marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.gray[500], marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray[700], marginBottom: 8, marginTop: 12 },
});
