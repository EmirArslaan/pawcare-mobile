// src/screens/map/MapScreen.js
// Simple map screen that works with Expo Go (no native maps needed)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    Image,
    TextInput,
    ScrollView,
    FlatList,
    Linking,
    RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage, Button } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

export default function MapScreen() {
    const [feeds, setFeeds] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [newPoint, setNewPoint] = useState({
        type: 'feed',
        status: 'food_provided',
        notes: '',
        description: '',
        imageUri: null,
    });

    const user = useAuthStore((state) => state.user);

    const fetchMapData = async () => {
        try {
            setError(null);
            const [feedsRes, sheltersRes, emergencyRes] = await Promise.all([
                apiClient.get('/feeds'),
                apiClient.get('/shelters'),
                apiClient.get('/emergency'),
            ]);
            setFeeds(feedsRes.data);
            setShelters(sheltersRes.data);
            setEmergencies(emergencyRes.data);
        } catch (err) {
            console.error('Map data error:', err);
            setError('Veriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                });
            }
        } catch (err) {
            console.log('Location error:', err);
        }
    };

    useEffect(() => {
        fetchMapData();
        getUserLocation();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMapData();
    };

    // Combine and filter all points
    const getAllPoints = () => {
        let points = [];

        if (filter === 'all' || filter === 'feeds') {
            feeds.forEach(item => {
                points.push({
                    id: item._id,
                    type: 'feed',
                    emoji: item.status === 'food_provided' ? '🥣' : '🫙',
                    title: item.status === 'food_provided' ? 'Mama Bırakıldı' : 'Mama İhtiyacı',
                    description: item.notes || '',
                    user: item.user?.username || 'Bilinmiyor',
                    date: item.createdAt,
                    imageUrl: item.imageUrl,
                    lat: item.location?.coordinates?.[1],
                    lng: item.location?.coordinates?.[0],
                });
            });
        }

        if (filter === 'all' || filter === 'shelters') {
            shelters.forEach(item => {
                points.push({
                    id: item._id,
                    type: 'shelter',
                    emoji: '🏠',
                    title: 'Barınak',
                    description: item.description || '',
                    user: item.user?.username || 'Bilinmiyor',
                    date: item.createdAt,
                    imageUrl: item.imageUrl,
                    lat: item.location?.coordinates?.[1],
                    lng: item.location?.coordinates?.[0],
                });
            });
        }

        if (filter === 'all' || filter === 'emergency') {
            emergencies.forEach(item => {
                points.push({
                    id: item._id,
                    type: 'emergency',
                    emoji: '🚨',
                    title: 'ACİL DURUM',
                    description: item.description || '',
                    user: item.user?.username || 'Bilinmiyor',
                    date: item.createdAt,
                    imageUrl: item.imageUrl,
                    lat: item.location?.coordinates?.[1],
                    lng: item.location?.coordinates?.[0],
                });
            });
        }

        // Sort by date (newest first)
        return points.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const openInMaps = (lat, lng) => {
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        Linking.openURL(url);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setNewPoint({ ...newPoint, imageUri: result.assets[0].uri });
        }
    };

    const handleSubmitPoint = async () => {
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

            // Upload image first
            const formData = new FormData();
            formData.append('image', {
                uri: newPoint.imageUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            const uploadRes = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const imageUrl = uploadRes.data.url;

            // Create the point based on type
            const pointData = {
                location: {
                    type: 'Point',
                    coordinates: [userLocation.lng, userLocation.lat],
                },
                imageUrl,
            };

            if (newPoint.type === 'feed') {
                await apiClient.post('/feeds', {
                    ...pointData,
                    status: newPoint.status,
                    notes: newPoint.notes,
                });
            } else if (newPoint.type === 'shelter') {
                await apiClient.post('/shelters', {
                    ...pointData,
                    description: newPoint.description,
                });
            } else if (newPoint.type === 'emergency') {
                await apiClient.post('/emergency', {
                    ...pointData,
                    description: newPoint.description,
                });
            }

            Alert.alert('Başarılı', 'Nokta eklendi!');
            setModalVisible(false);
            setNewPoint({
                type: 'feed',
                status: 'food_provided',
                notes: '',
                description: '',
                imageUri: null,
            });
            fetchMapData();
        } catch (err) {
            console.error('Add point error:', err);
            Alert.alert('Hata', 'Nokta eklenemedi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Veriler yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchMapData} />;
    }

    const points = getAllPoints();

    const renderPointCard = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.pointCard,
                item.type === 'emergency' && styles.emergencyCard,
            ]}
            onPress={() => item.lat && item.lng && openInMaps(item.lat, item.lng)}
        >
            <View style={styles.pointHeader}>
                <Text style={styles.pointEmoji}>{item.emoji}</Text>
                <View style={styles.pointInfo}>
                    <Text style={[
                        styles.pointTitle,
                        item.type === 'emergency' && { color: COLORS.danger }
                    ]}>
                        {item.title}
                    </Text>
                    <Text style={styles.pointUser}>Paylaşan: {item.user}</Text>
                    <Text style={styles.pointDate}>
                        {new Date(item.date).toLocaleDateString('tr-TR')}
                    </Text>
                </View>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.pointImage} />
                )}
            </View>
            {item.description ? (
                <Text style={styles.pointDescription}>{item.description}</Text>
            ) : null}
            <Text style={styles.mapLink}>📍 Haritada göster →</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🗺️ Harita Noktaları</Text>
                {user && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>+ Ekle</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filters}>
                <FilterChip
                    title="Tümü"
                    active={filter === 'all'}
                    onPress={() => setFilter('all')}
                />
                <FilterChip
                    title="🥣 Besleme"
                    active={filter === 'feeds'}
                    onPress={() => setFilter('feeds')}
                />
                <FilterChip
                    title="🏠 Barınak"
                    active={filter === 'shelters'}
                    onPress={() => setFilter('shelters')}
                />
                <FilterChip
                    title="🚨 Acil"
                    active={filter === 'emergency'}
                    onPress={() => setFilter('emergency')}
                    color={COLORS.danger}
                />
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <Text style={styles.statText}>
                    🥣 {feeds.length} Besleme  •  🏠 {shelters.length} Barınak  •  🚨 {emergencies.length} Acil
                </Text>
            </View>

            {/* Points List */}
            <FlatList
                data={points}
                keyExtractor={(item) => item.id}
                renderItem={renderPointCard}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📍</Text>
                        <Text style={styles.emptyText}>Bu kategoride nokta bulunamadı.</Text>
                    </View>
                }
            />

            {/* Add Point Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Yeni Nokta Ekle</Text>
                        <Text style={styles.modalSubtitle}>
                            📍 Mevcut konumunuz kullanılacak
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Type Selection */}
                            <Text style={styles.modalLabel}>Tür</Text>
                            <View style={styles.typeButtons}>
                                <TouchableOpacity
                                    style={[styles.typeButton, newPoint.type === 'feed' && styles.typeButtonActive]}
                                    onPress={() => setNewPoint({ ...newPoint, type: 'feed' })}
                                >
                                    <Text style={styles.typeEmoji}>🥣</Text>
                                    <Text style={styles.typeText}>Besleme</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, newPoint.type === 'shelter' && styles.typeButtonActive]}
                                    onPress={() => setNewPoint({ ...newPoint, type: 'shelter' })}
                                >
                                    <Text style={styles.typeEmoji}>🏠</Text>
                                    <Text style={styles.typeText}>Barınak</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, newPoint.type === 'emergency' && styles.typeButtonActive]}
                                    onPress={() => setNewPoint({ ...newPoint, type: 'emergency' })}
                                >
                                    <Text style={styles.typeEmoji}>🚨</Text>
                                    <Text style={styles.typeText}>Acil</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Status for Feed */}
                            {newPoint.type === 'feed' && (
                                <>
                                    <Text style={styles.modalLabel}>Durum</Text>
                                    <View style={styles.statusButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                newPoint.status === 'food_provided' && styles.statusButtonActive,
                                            ]}
                                            onPress={() => setNewPoint({ ...newPoint, status: 'food_provided' })}
                                        >
                                            <Text style={styles.statusText}>✓ Mama Bırakıldı</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                newPoint.status === 'needs_food' && styles.statusButtonActive,
                                            ]}
                                            onPress={() => setNewPoint({ ...newPoint, status: 'needs_food' })}
                                        >
                                            <Text style={styles.statusText}>! Mama Gerekli</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Not (opsiyonel)"
                                        placeholderTextColor={COLORS.gray[400]}
                                        value={newPoint.notes}
                                        onChangeText={(text) => setNewPoint({ ...newPoint, notes: text })}
                                    />
                                </>
                            )}

                            {/* Description for Shelter/Emergency */}
                            {(newPoint.type === 'shelter' || newPoint.type === 'emergency') && (
                                <>
                                    <Text style={styles.modalLabel}>Açıklama</Text>
                                    <TextInput
                                        style={[styles.modalInput, { height: 80 }]}
                                        placeholder="Açıklama yazın..."
                                        placeholderTextColor={COLORS.gray[400]}
                                        value={newPoint.description}
                                        onChangeText={(text) => setNewPoint({ ...newPoint, description: text })}
                                        multiline
                                    />
                                </>
                            )}

                            {/* Image */}
                            <Text style={styles.modalLabel}>Fotoğraf *</Text>
                            {newPoint.imageUri ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: newPoint.imageUri }} style={styles.imagePreview} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => setNewPoint({ ...newPoint, imageUri: null })}
                                    >
                                        <Text style={styles.removeImageText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                    <Text style={styles.addImageIcon}>📷</Text>
                                    <Text style={styles.addImageText}>Fotoğraf Seç</Text>
                                </TouchableOpacity>
                            )}

                            {/* Actions */}
                            <View style={styles.modalActions}>
                                <Button
                                    title="İptal"
                                    onPress={() => setModalVisible(false)}
                                    variant="outline"
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <Button
                                    title="Ekle"
                                    onPress={handleSubmitPoint}
                                    loading={submitting}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function FilterChip({ title, active, onPress, color = COLORS.primary[500] }) {
    return (
        <TouchableOpacity
            style={[styles.filterChip, active && { backgroundColor: color }]}
            onPress={onPress}
        >
            <Text style={[styles.filterChipText, active && { color: COLORS.white }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    addButton: {
        backgroundColor: COLORS.primary[500],
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    // Filters
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: COLORS.gray[200],
        marginHorizontal: 4,
    },
    filterChipText: {
        fontSize: 13,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    // Stats
    stats: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: COLORS.primary[50],
    },
    statText: {
        fontSize: 13,
        color: COLORS.primary[600],
        textAlign: 'center',
    },
    // List
    listContent: {
        padding: 16,
    },
    // Point Card
    pointCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    emergencyCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.danger,
    },
    pointHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pointEmoji: {
        fontSize: 28,
        marginRight: 12,
    },
    pointInfo: {
        flex: 1,
    },
    pointTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.gray[900],
        marginBottom: 2,
    },
    pointUser: {
        fontSize: 13,
        color: COLORS.gray[600],
    },
    pointDate: {
        fontSize: 12,
        color: COLORS.gray[400],
        marginTop: 2,
    },
    pointImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: COLORS.gray[200],
    },
    pointDescription: {
        fontSize: 13,
        color: COLORS.gray[700],
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[100],
    },
    mapLink: {
        fontSize: 12,
        color: COLORS.primary[500],
        marginTop: 8,
        fontWeight: '500',
    },
    // Empty
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray[500],
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray[900],
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 13,
        color: COLORS.gray[500],
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray[700],
        marginBottom: 8,
        marginTop: 12,
    },
    modalInput: {
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.gray[900],
    },
    // Type Buttons
    typeButtons: {
        flexDirection: 'row',
    },
    typeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        marginRight: 8,
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary[100],
        borderWidth: 1,
        borderColor: COLORS.primary[500],
    },
    typeEmoji: {
        fontSize: 20,
        marginBottom: 4,
    },
    typeText: {
        fontSize: 12,
        color: COLORS.gray[700],
    },
    // Status Buttons
    statusButtons: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: COLORS.gray[100],
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    statusButtonActive: {
        backgroundColor: COLORS.primary[100],
        borderWidth: 1,
        borderColor: COLORS.primary[500],
    },
    statusText: {
        fontSize: 13,
        color: COLORS.gray[700],
    },
    // Image
    imagePreviewContainer: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.danger,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: COLORS.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
    },
    addImageIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    addImageText: {
        fontSize: 11,
        color: COLORS.gray[500],
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 24,
        marginBottom: 16,
    },
});
