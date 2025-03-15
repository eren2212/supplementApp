"use client";
import { useState } from "react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  imageUrl: string;
}

const ProfilePage = () => {
  // Başlangıçta varsayılan kullanıcı bilgileri
  const initialProfile: UserProfile = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "********",
    address: "123 Main Street, Some City",
    imageUrl: "https://via.placeholder.com/200", // Profil fotoğrafı
  };

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Değişiklikleri kaydet
  const handleSave = () => {
    setIsEditing(false);
    // Burada bir API çağrısı yaparak verileri sunucuya kaydedebilirsiniz
    console.log("Kullanıcı bilgileri kaydedildi:", profile);
  };

  // Kullanıcı bilgilerini güncelle
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof UserProfile
  ) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-50">
      <div className="flex items-center mb-6">
        {/* Profil Fotoğrafı */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={profile.imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-6">
          {/* Ad Soyad */}
          <h2 className="text-2xl font-semibold">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      <div className="mb-4">
        {/* Ad, Soyad, E-posta, Şifre */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Ad
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => handleChange(e, "firstName")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="mt-1">{profile.firstName}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Soyad
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => handleChange(e, "lastName")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="mt-1">{profile.lastName}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            E-posta
          </label>
          {isEditing ? (
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange(e, "email")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1">{profile.email}</p>
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Şifre
          </label>
          {isEditing ? (
            <input
              type="password"
              value={profile.password}
              onChange={(e) => handleChange(e, "password")}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1">********</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        {/* Adres */}
        <label className="block text-sm font-medium text-gray-700">Adres</label>
        {isEditing ? (
          <input
            type="text"
            value={profile.address}
            onChange={(e) => handleChange(e, "address")}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        ) : (
          <p className="mt-1">{profile.address}</p>
        )}
      </div>

      <div className="flex space-x-4">
        {/* Düzenle ve Kaydet Butonları */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          {isEditing ? "İptal" : "Düzenle"}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Kaydet
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
