// src/screens/adoption/AdoptionDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    Linking,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage, Button } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

const { width } = Dimensions.get('window');

export default function AdoptionDetailScreen({ route, navigation }) {
    const { id } = route.params;
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const user = useAuthStore((state) => state.user);

    const fetchListing = async () => {
        try {
            setError(null);
            const response = await apiClient.get(`/adoption/${id}`);
            setListing(response.data);
        } catch (err) {
            console.error('Adoption detail error:', err);
            setError('İlan yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListing();
    }, [id]);

    const handleDelete = () => {
        Alert.alert(
            'İlanı Sil',
            'Bu ilanı silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/adoption/${id}`);
                            Alert.alert('Başarılı', 'İlan silindi.', [
                                { text: 'Tamam', onPress: () => navigation.goBack() },
                            ]);
                        } catch (err) {
                            Alert.alert('Hata', 'İlan silinemedi.');
                        }
                    },
                },
            ]
        );
    };

    const handleContact = () => {
        if (listing?.user?.email) {
            Linking.openURL(`mailto:${listing.user.email}?subject=PawCare - ${listing.title} Hakkında`);
        } else {
            Alert.alert('Bilgi', 'İletişim bilgisi bulunamadı.');
        }
    };

    if (loading) {
        return <LoadingSpinner message="İlan yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchListing} />;
    }

    if (!listing) {
        return <ErrorMessage message="İlan bulunamadı." />;
    }

    const isOwner = user && listing.user?._id === user._id;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Image Gallery */}
            <View style={styles.imageContainer}>
                {listing.imageUrls?.length > 0 ? (
                    <>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                        >
                            {listing.imageUrls.map((url, index) => (
                                <Image key={index} source={{ uri: url }} style={styles.image} />
                            ))}
                        </ScrollView>
                        {listing.imageUrls.length > 1 && (
                            <View style={styles.pagination}>
                                {listing.imageUrls.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            index === currentImageIndex && styles.paginationDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.noImage}>
                        <Text style={styles.noImageText}>📷 Fotoğraf yok</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{listing.title}</Text>
                <Text style={styles.location}>📍 {listing.locationString}</Text>

                {/* Tags */}
                <View style={styles.tags}>
                    <View style={[styles.tag, { backgroundColor: COLORS.secondary[50] }]}>
                        <Text style={[styles.tagText, { color: COLORS.secondary[600] }]}>
                            {listing.age}
                        </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: COLORS.primary[50] }]}>
                        <Text style={[styles.tagText, { color: COLORS.primary[600] }]}>
                            {listing.gender === 'male' ? '♂ Erkek' : '♀ Dişi'}
                        </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: COLORS.accent + '20' }]}>
                        <Text style={[styles.tagText, { color: COLORS.accent }]}>
                            {listing.animalType === 'dog' ? '🐕 Köpek' : listing.animalType === 'cat' ? '🐈 Kedi' : '🐾 Diğer'}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Açıklama</Text>
                    <Text style={styles.description}>{listing.description || 'Açıklama eklenmemiş.'}</Text>
                </View>

                {/* Owner Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>İlan Sahibi</Text>
                    <View style={styles.ownerCard}>
                        <View style={styles.ownerAvatar}>
                            <Text style={styles.ownerAvatarText}>
                                {listing.user?.username?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={styles.ownerInfo}>
                            <Text style={styles.ownerName}>{listing.user?.username || 'Bilinmiyor'}</Text>
                            <Text style={styles.ownerDate}>
                                İlan Tarihi: {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                {isOwner ? (
                    <View style={styles.actions}>
                        <Button
                            title="Düzenle"
                            onPress={() => navigation.navigate('EditAdoption', { id: listing._id })}
                            style={{ flex: 1, marginRight: 8 }}
                        />
                        <Button
                            title="Sil"
                            onPress={handleDelete}
                            variant="danger"
                            style={{ flex: 1 }}
                        />
                    </View>
                ) : (
                    <Button
                        title="📧 İletişime Geç"
                        onPress={handleContact}
                        size="large"
                        style={{ marginTop: 16 }}
                    />
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollContent: {
        paddingBottom: 32,
    },
    // Image
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: width,
        height: 280,
        backgroundColor: COLORS.gray[200],
    },
    noImage: {
        width: width,
        height: 200,
        backgroundColor: COLORS.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 16,
        color: COLORS.gray[500],
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white + '80',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: COLORS.white,
    },
    // Content
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: COLORS.gray[600],
        marginBottom: 16,
    },
    // Tags
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Sections
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.gray[800],
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: COLORS.gray[700],
        lineHeight: 22,
    },
    // Owner
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    ownerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ownerAvatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.gray[900],
        marginBottom: 2,
    },
    ownerDate: {
        fontSize: 13,
        color: COLORS.gray[500],
    },
    // Actions
    actions: {
        flexDirection: 'row',
        marginTop: 16,
    },
});
