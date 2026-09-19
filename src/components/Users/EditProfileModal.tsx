import React, { useRef, useState } from 'react';
import { User, Phone, Info, Camera, X } from 'lucide-react';
import type { IUser } from '@/interfaces/user.interface';
import { usersService } from '@/services/user/api/users.api';
import type { ICloudinaryImage } from '@/interfaces/cloudImage';
import BaseModal from '@/common/BaseModal';

export interface EditProfileData {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  company_email: string;
  profile_picture?: ICloudinaryImage | null;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: EditProfileData;
  onSuccess: (updatedUser: IUser | null | undefined) => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone_number: string;
}

type FormField = keyof FormData;

const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize inputs as empty so current values act as placeholders
  const [formData, setFormData] = useState<FormData>({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    phone_number: initialData.phone_number || '',
  });

  const [currentProfilePicture] = useState<ICloudinaryImage | null>(
    initialData.profile_picture ?? null,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData.profile_picture?.url ?? null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleFieldChange = (field: FormField, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError(undefined);
    }
  };

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Profile picture must be a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      setError('Profile picture must be less than 5MB.');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setError(undefined);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveProfilePicture = () => {
    setSelectedFile(null);
    setPreviewUrl(currentProfilePicture?.url ?? null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setError(undefined);
  };

  const validateForm = (): string | undefined => {
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    const phoneNumber = formData.phone_number.trim();

    if (firstName) {
      if (firstName.length < 2) {
        return 'First name must be at least 2 characters.';
      }
      if (firstName.length > 100) {
        return 'First name cannot exceed 100 characters.';
      }
    }

    if (lastName) {
      if (lastName.length < 2) {
        return 'Last name must be at least 2 characters.';
      }
      if (lastName.length > 100) {
        return 'Last name cannot exceed 100 characters.';
      }
    }

    if (phoneNumber) {
      if (phoneNumber.length > 100) {
        return 'Phone number cannot exceed 100 characters.';
      }
      if (!/^[+]?[0-9][0-9\s\-()]{6,99}$/.test(phoneNumber)) {
        return 'Please enter a valid phone number.';
      }
    }

    return undefined;
  };

  const hasChanges = (): boolean => {
    const firstNameChanged = formData.first_name.trim() !== '';
    const lastNameChanged = formData.last_name.trim() !== '';
    const phoneNumberChanged = formData.phone_number.trim() !== '';
    const profilePictureChanged = selectedFile !== null;

    return (
      firstNameChanged ||
      lastNameChanged ||
      phoneNumberChanged ||
      profilePictureChanged
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(undefined);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!hasChanges()) {
      setError('No changes were made to your profile.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      if (formData.first_name.trim() !== '') {
        payload.append('first_name', formData.first_name.trim());
      }

      if (formData.last_name.trim() !== '') {
        payload.append('last_name', formData.last_name.trim());
      }

      if (formData.phone_number.trim() !== '') {
        payload.append('phone_number', formData.phone_number.trim());
      }

      if (selectedFile) {
        payload.append('profile_picture', selectedFile);
      }

      const { data } = await usersService.update(initialData.id, payload);

      onSuccess(data);
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);

      setError(
        'Failed to update profile. Please check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials =
    `${initialData.first_name?.[0] ?? ''}${
      initialData.last_name?.[0] ?? ''
    }`.toUpperCase() || 'U';

  return (
    <BaseModal
      isOpen={isOpen}
      title="Edit Personal Details"
      subtitle="Update your name and contact information."
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? 'Updating Profile...' : 'Update Profile'}
      error={error}
    >
      <fieldset disabled={isSubmitting} className="space-y-5 border-0 p-0 m-0">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`${initialData.first_name} ${initialData.last_name}`}
                className="h-16 w-16 rounded-full border border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 text-lg font-bold text-cyan-400">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
              aria-label="Change profile picture"
            >
              <Camera size={11} className="cursor-pointer" />
            </button>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200">
              Profile Picture
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              JPG, PNG or WEBP · Maximum 5MB
            </p>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="text-[11px] cursor-pointer font-semibold text-cyan-400 transition-colors hover:text-cyan-300 disabled:opacity-50"
              >
                Change photo
              </button>

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  disabled={isSubmitting}
                  className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors hover:text-red-400 disabled:opacity-50"
                >
                  <X size={12} />
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleProfilePictureChange}
          />
        </div>

        {/* Name Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="first_name"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              First Name
            </label>

            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />

              <input
                id="first_name"
                type="text"
                maxLength={100}
                placeholder={initialData.first_name}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
                value={formData.first_name}
                onChange={(e) =>
                  handleFieldChange('first_name', e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="last_name"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Last Name
            </label>

            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />

              <input
                id="last_name"
                type="text"
                maxLength={100}
                placeholder={initialData.last_name}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
                value={formData.last_name}
                onChange={(e) => handleFieldChange('last_name', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Phone Number
          </label>

          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />

            <input
              id="phone"
              type="tel"
              maxLength={100}
              placeholder={initialData.phone_number || '+234...'}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50"
              value={formData.phone_number}
              onChange={(e) =>
                handleFieldChange('phone_number', e.target.value)
              }
            />
          </div>
        </div>

        {/* Read-only Email Notice */}
        <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Info className="shrink-0 text-blue-500" size={16} />

          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-blue-900">
              Email & Role Management
            </p>

            <p className="text-[10px] leading-relaxed text-blue-700">
              Your email ({initialData.company_email}) and workspace role are
              managed by your organization administrator for security purposes.
            </p>
          </div>
        </div>
      </fieldset>
    </BaseModal>
  );
};
