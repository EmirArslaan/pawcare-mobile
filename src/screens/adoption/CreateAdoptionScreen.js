// src/screens/adoption/CreateAdoptionScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/api';
import { Button } from '../../components/common';
import apiClient from '../../api/client';

export default function CreateAdoptionScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        animalType: 'dog',
        age: '',
        gender: 'male',
        locationString: '',
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        if (!formData.title.trim() || !formData.locationString.trim()) {
            Alert.alert('Hata', 'Lütfen başlık ve konum alanlarını doldurun.');
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
                imageUrls.push(uploadRes.data.url);
            }

            // Create listing
            await apiClient.post('/adoption', {
                ...formData,
                imageUrls,
            });

            Alert.alert('Başarılı', 'İlanınız oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Create adoption error:', error);
            Alert.alert('Hata', 'İlan oluşturulamadı. Lütfen tekrar deneyin.');
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
            <Text style={styles.pageTitle}>Sahiplendirme İlanı Oluştur</Text>

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

            {/* Title */}
            <View style={styles.section}>
                <Text style={styles.label}>Başlık *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: Sevimli Golden Retriever Yuva Arıyor"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
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

            {/* Age */}
            <View style={styles.section}>
                <Text style={styles.label}>Yaş</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: 2 yaş, 6 aylık, Yavru"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                />
            </View>

            {/* Gender */}
            <View style={styles.section}>
                <Text style={styles.label}>Cinsiyet</Text>
                <View style={styles.genderButtons}>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            formData.gender === 'male' && styles.genderButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, gender: 'male' })}
                    >
                        <Text style={styles.genderEmoji}>♂️</Text>
                        <Text
                            style={[
                                styles.genderText,
                                formData.gender === 'male' && styles.genderTextActive,
                            ]}
                        >
                            Erkek
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderButton,
                            formData.gender === 'female' && styles.genderButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, gender: 'female' })}
                    >
                        <Text style={styles.genderEmoji}>♀️</Text>
                        <Text
                            style={[
                                styles.genderText,
                                formData.gender === 'female' && styles.genderTextActive,
                            ]}
                        >
                            Dişi
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
                <Text style={styles.label}>Konum *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: İstanbul, Kadıköy"
                    placeholderTextColor={COLORS.gray[400]}
                    value={formData.locationString}
                    onChangeText={(text) => setFormData({ ...formData, locationString: text })}
                />
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Hayvan hakkında detaylı bilgi..."
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
                title="İlanı Yayınla"
                onPress={handleSubmit}
                loading={loading}
                size="large"
                style={{ marginTop: 8, marginBottom: 24 }}
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
        color: COLORS.gray[900],
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
        borderColor: COLORS.gray[300],
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
        backgroundColor: COLORS.primary[50],
        borderColor: COLORS.primary[500],
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
        color: COLORS.primary[600],
        fontWeight: '600',
    },
    // Gender buttons
    genderButtons: {
        flexDirection: 'row',
    },
    genderButton: {
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
    genderButtonActive: {
        backgroundColor: COLORS.secondary[50],
        borderColor: COLORS.secondary[500],
    },
    genderEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    genderText: {
        fontSize: 14,
        color: COLORS.gray[700],
    },
    genderTextActive: {
        color: COLORS.secondary[600],
        fontWeight: '600',
    },
});
