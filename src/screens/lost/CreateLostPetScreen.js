// src/screens/lost/CreateLostPetScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../../constants/api';
import { Button } from '../../components/common';
import apiClient from '../../api/client';

export default function CreateLostPetScreen({ navigation }) {
    const [formData, setFormData] = useState({
        petName: '',
        description: '',
        animalType: 'dog',
        locationString: '',
        lostDate: new Date().toISOString().split('T')[0],
        contactInfo: '',
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Get user location on mount
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        })();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });

        if (!result.canceled && result.assets) {
            setImages([...images, ...result.assets.map(a => a.uri)].slice(0, 5));
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.petName.trim()) {
            Alert.alert('Hata', 'Lütfen hayvanın adını girin.');
            return;
        }

        if (!formData.locationString.trim()) {
            Alert.alert('Hata', 'Lütfen son görülme konumunu girin.');
            return;
        }

        if (!formData.contactInfo.trim()) {
            Alert.alert('Hata', 'Lütfen iletişim bilgisi girin.');
            return;
        }

        if (images.length === 0) {
            Alert.alert('Hata', 'Lütfen en az bir fotoğraf ekleyin.');
            return;
        }

        try {
            setLoading(true);

            // First upload images
            const imageUrls = [];
            for (const imageUri of images) {
                const formDataImage = new FormData();
                formDataImage.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });

                const uploadRes = await apiClient.post('/upload', formDataImage, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrls.push(uploadRes.data.url || uploadRes.data.imageUrl);
            }

            // Prepare location data - use user's current location or default
            const lastSeenLocation = userLocation ? {
                type: 'Point',
                coordinates: [userLocation.longitude, userLocation.latitude],
            } : {
                type: 'Point',
                coordinates: [28.9784, 41.0082], // Default Istanbul coordinates
            };

            // Create listing
            await apiClient.post('/lostpets', {
                petName: formData.petName,
                animalType: formData.animalType,
                description: formData.description || 'Kayıp hayvan',
                imageUrls,
                lastSeenLocation,
                locationString: formData.locationString,
                lostDate: formData.lostDate,
                contactInfo: formData.contactInfo,
            });

            Alert.alert('Başarılı', 'Kayıp ilanınız oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Create lost pet error:', error.response?.data || error);
            Alert.alert('Hata', error.response?.data?.message || 'İlan oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    const TypeButton = ({ type, label, emoji }) => (
        <TouchableOpacity
            style={[
                styles.typeButton,
                formData.animalType === type && styles.typeButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, animalType: type })}
        >
            <Text style={styles.typeButtonEmoji}>{emoji}</Text>
            <Text
                style={[
                    styles.typeButtonText,
                    formData.animalType === type && styles.typeButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.pageTitle}>🚨 Kayıp İlanı Oluştur</Text>

            {/* Images */}
            <View style={styles.section}>
                <Text style={styles.label}>Fotoğraflar *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity
                                style={styles.removeImage}
                                onPress={() => removeImage(index)}
                            >
                                <Text style={styles.removeImageText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    {images.length < 5 && (
                        <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                            <Text style={styles.addImageIcon}>📷</Text>
                            <Text style={styles.addImageText}>Fotoğraf Ekle</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
                <Text style={styles.hint}>En fazla 5 fotoğraf ekleyebilirsiniz</Text>
            </View>

            {/* Pet Name */}
            <View style={styles.section}>
                <Text style={styles.label}>Hayvanın Adı *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: Pamuk, Max"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.petName}
                    onChangeText={(text) => setFormData({ ...formData, petName: text })}
                />
            </View>

            {/* Animal Type */}
            <View style={styles.section}>
                <Text style={styles.label}>Hayvan Türü</Text>
                <View style={styles.typeButtons}>
                    <TypeButton type="dog" label="Köpek" emoji="🐕" />
                    <TypeButton type="cat" label="Kedi" emoji="🐈" />
                    <TypeButton type="other" label="Diğer" emoji="🐾" />
                </View>
            </View>

            {/* Lost Date */}
            <View style={styles.section}>
                <Text style={styles.label}>Kaybolma Tarihi *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (Örn: 2024-12-07)"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.lostDate}
                    onChangeText={(text) => setFormData({ ...formData, lostDate: text })}
                />
            </View>

            {/* Location */}
            <View style={styles.section}>
                <Text style={styles.label}>Son Görülme Yeri *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: İstanbul, Kadıköy, Moda Parkı yanı"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.locationString}
                    onChangeText={(text) => setFormData({ ...formData, locationString: text })}
                />
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
                <Text style={styles.label}>İletişim Bilgisi *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Telefon numarası veya e-posta"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.contactInfo}
                    onChangeText={(text) => setFormData({ ...formData, contactInfo: text })}
                    keyboardType="phone-pad"
                />
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Hayvanın özellikleri, nasıl kaybolduğu vb..."
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* Submit */}
            <Button
                title="Kayıp İlanı Yayınla"
                onPress={handleSubmit}
                loading={loading}
                size="large"
                style={{ marginTop: 8, marginBottom: 24, backgroundColor: COLORS.danger }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollContent: {
        padding: 16,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.danger,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray[700],
        marginBottom: 8,
    },
    hint: {
        fontSize: 12,
        color: COLORS.gray[500],
        marginTop: 8,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.gray[900],
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    // Images
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: COLORS.gray[200],
    },
    removeImage: {
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
        borderColor: COLORS.danger + '60',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    addImageIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    addImageText: {
        fontSize: 11,
        color: COLORS.gray[500],
        textAlign: 'center',
    },
    // Type buttons
    typeButtons: {
        flexDirection: 'row',
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: COLORS.danger + '15',
        borderColor: COLORS.danger,
    },
    typeButtonEmoji: {
        fontSize: 18,
        marginRight: 6,
    },
    typeButtonText: {
        fontSize: 14,
        color: COLORS.gray[700],
    },
    typeButtonTextActive: {
        color: COLORS.danger,
        fontWeight: '600',
    },
});
