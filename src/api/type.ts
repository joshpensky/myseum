import { GetServerSidePropsContext } from 'next';
import { AuthChangeEvent, User } from '@supabase/supabase-js';
import { AxiosRequestConfig } from 'axios';
import { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import {
  AddPlacedArtworkDto,
  CreateGalleryDto,
  UpdateGalleryDto,
} from '@src/data/repositories/gallery.repository';
import { UpdateMuseumDto } from '@src/data/repositories/museum.repository';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { GalleryDto, PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto, MuseumWithGalleriesDto } from '@src/data/serializers/museum.serializer';
import { UserDto } from '@src/data/serializers/user.serializer';

export interface MyseumAPI {
  artwork: {
    /**
     * Creates a new artwork.
     *
     * @param data the artwork data
     * @returns the created artwork
     */
    create(data: CreateArtworkDto): Promise<ArtworkDto>;

    /**
     * Finds all artworks for a given user.
     *
     * @param user the user to search within
     * @return the user's artworks
     */
    findAllByUser(user: UserDto): Promise<ArtworkDto[]>;
  };

  auth: {
    /**
     * Gets a user based on SSR context.
     *
     * @param context the Next.js SSR context
     * @return the user attached to the cookie, or null if none
     */
    findUserByCookie(context: GetServerSidePropsContext): Promise<UserDto | null>;

    /**
     * Gets the current signed-in user.
     *
     * @return the current signed-in user, or null if none
     */
    getCurrentUser(): User | null;

    /**
     * Event handler for auth state changes.
     *
     * @param callback a callback to subscribe to state changes
     * @return an unsubscribe function
     */
    onStateChange(
      callback: (event: AuthChangeEvent, user: User | null) => void,
    ): { unsubscribe(): void } | null;

    /**
     * Signs the user in.
     *
     * @param options an optional redirectTo destination
     */
    signIn(options?: { redirectTo?: string }): Promise<void>;

    /**
     * Signs the user out.
     */
    signOut(): Promise<void>;
  };

  frame: {
    /**
     * Finds all frames for a given user.
     *
     * @param user the user to search within
     * @return the user's frames
     */
    findAllByUser(user: UserDto): Promise<FrameDto[]>;
  };

  gallery: {
    /**
     * Adds a new placed artwork onto the given gallery.
     *
     * @param gallery the gallery to place the artwork on
     * @param data the placed artwork data
     * @return the placed artwork
     */
    addPlacedArtwork(gallery: GalleryDto, data: AddPlacedArtworkDto): Promise<PlacedArtworkDto>;

    /**
     * Creates a new gallery.
     *
     * @param data the gallery data
     * @return the created gallery
     */
    create(data: CreateGalleryDto): Promise<GalleryDto>;

    /**
     * Finds all galleries within a given museum.
     *
     * @param museum the museum to search within
     * @return the museum's galleries
     */
    findAllByMuseum(museum: MuseumDto): Promise<GalleryDto[]>;

    /**
     * Finds one gallery by a given ID within a given museum.
     *
     * @param museumId the museum to search within
     * @param galleryId the gallery's ID
     * @return the matched gallery, or null if not found
     */
    findOneByMuseum(museumId: string, galleryId: string): Promise<GalleryDto | null>;

    /**
     * Updates an existing gallery.
     *
     * @param museumId the parent museum ID
     * @param galleryId the gallery ID to update
     * @param data the gallery data
     * @return the updated gallery
     */
    update(museumId: string, galleryId: string, data: UpdateGalleryDto): Promise<GalleryDto>;

    /**
     * Deletes an existing gallery.
     *
     * @param museumId the parent museum ID
     * @param galleryId the gallery ID to delete
     */
    delete(museumId: string, galleryId: string): Promise<void>;
  };

  museum: {
    /**
     * Finds a musuem for a given curator.
     *
     * @param curator the museum's curator
     * @return the curator's museum
     */
    findOneByCurator(curator: UserDto): Promise<MuseumDto>;

    /**
     * Finds a museum by a given ID.
     *
     * @param id the museum's ID
     * @return the matched museum, or null if not found
     */
    findOneById(id: string): Promise<MuseumDto | null>;

    /**
     * Updates a museum with the given ID.
     *
     * @param id the museum's ID
     * @param data the museum updated data
     * @return the updated museum
     */
    update(id: string, data: UpdateMuseumDto): Promise<MuseumWithGalleriesDto>;
  };

  user: {
    /**
     * Finds a user by a given ID.
     *
     * @param id the user's ID
     * @return the matched user, or null if not found
     */
    findOneById(id: string, config?: AxiosRequestConfig<any>): Promise<UserDto | null>;
  };
}
