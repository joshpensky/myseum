import { GetServerSidePropsContext } from 'next';
import { CreateArtworkDto } from '@src/data/repositories/artwork.repository';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
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
  };

  user: {
    /**
     * Finds a user by a given ID.
     *
     * @param id the user's ID
     * @return the matched user, or null if not found
     */
    findOneById(id: string): Promise<UserDto | null>;
  };
}
