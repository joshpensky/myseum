import { Fragment, useRef, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import toast from 'react-hot-toast';
import * as z from 'zod';
import AutofitTextField from '@src/components/AutofitTextField';
import Button from '@src/components/Button';
import { ClientOnly } from '@src/components/ClientOnly';
import FloatingActionButton from '@src/components/FloatingActionButton';
import IconButton from '@src/components/IconButton';
import { KeyboardShortcut } from '@src/components/KeyboardShortcut';
import MuseumMap, { CreateUpdateGalleryDto } from '@src/components/MuseumMap';
import { Tooltip } from '@src/components/Tooltip';
import ViewToggle from '@src/components/ViewToggle';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { GalleryDto, GallerySerializer } from '@src/data/GallerySerializer';
import { MuseumRepository, UpdateMuseumDto } from '@src/data/MuseumRepository';
import { MuseumDto, MuseumSerializer } from '@src/data/MuseumSerializer';
import { useGlobalLayout } from '@src/layouts/GlobalLayout';
import { MuseumLayout, MuseumLayoutProps } from '@src/layouts/MuseumLayout';
import { useAuth } from '@src/providers/AuthProvider';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import Edit from '@src/svgs/Edit';
import { PageComponent } from '@src/types';
import styles from './index.module.scss';

const updateMuseumSchema = z.object({
  name: z.string().refine(string => !!string.trim().length, {
    message: 'Museum must have a valid name.',
  }),
  galleries: z
    .array(
      z.object({
        id: z.number().positive().int().optional(),
        name: z.string().refine(string => !!string.trim().length, {
          message: 'Gallery must have a valid name.',
        }),
        color: z.nativeEnum(GalleryColor),
        height: z.number().positive().int(),
        position: z.object({
          x: z.number().int(),
          y: z.number().nonnegative().int(),
        }),
      }),
    )
    .refine(
      galleries => {
        const entranceGallery = galleries.find(
          gallery => gallery.position.x === 0 && gallery.position.y === 0,
        );
        return !!entranceGallery;
      },
      {
        message: 'There must be a gallery at the entrance',
      },
    ),
});

export interface MuseumMapViewProps {
  museum: MuseumDto;
  galleries: GalleryDto[];
}

const MuseumMapView: PageComponent<MuseumMapViewProps, MuseumLayoutProps> = (
  props: MuseumMapViewProps,
) => {
  const auth = useAuth();
  const layout = useGlobalLayout();

  const { museum, setMuseum } = useMuseum();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(museum.name);
  const [galleries, setGalleries] = useState<CreateUpdateGalleryDto[]>(props.galleries);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const onEdit = () => {
    setName(museum.name);
    setGalleries(props.galleries);
    layout.hideNav(true);
    setIsEditing(true);
    window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });
  };

  const exitEditMode = () => {
    layout.hideNav(false);
    setIsEditing(false);
    window.requestAnimationFrame(() => {
      editButtonRef.current?.focus();
    });
  };

  const onCancel = () => {
    // Reset state
    setName(museum.name);
    setGalleries(props.galleries);
    // Exit editing mode
    exitEditMode();
  };

  const onSave = async () => {
    setIsFormSubmitting(true);
    try {
      // Validates the museum
      const updateMuseumDto: UpdateMuseumDto = updateMuseumSchema.parse({
        name,
        galleries: galleries.map(gallery => ({
          id: gallery.id,
          name: gallery.name,
          color: gallery.color,
          height: gallery.height,
          position: gallery.position,
        })),
      });

      // If no errors, updates the gallery
      const res = await fetch(`/api/museum/${museum.id}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(updateMuseumDto),
      });

      // Throw error, if any
      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      // Update state
      const data = (await res.json()) as MuseumDto & { galleries: GalleryDto[] };
      setMuseum(data);
      setGalleries(data.galleries);
      exitEditMode();
      // Send success toast
      toast.success('Museum updated!');
    } catch (error) {
      // If error, send error toast
      toast.error(error.message);
    } finally {
      // Regardless, update form state
      setIsFormSubmitting(false);
    }
  };

  const canEdit = !!auth.user && auth.user.id === museum.curator.id;

  return (
    <Fragment>
      <Head>
        <title>{museum.name} | Myseum</title>
      </Head>

      {canEdit && !isEditing && (
        <div className={styles.fab}>
          <FloatingActionButton ref={editButtonRef} title="Edit museum" onClick={() => onEdit()}>
            <Edit />
          </FloatingActionButton>
        </div>
      )}

      {canEdit && isEditing && (
        <ThemeProvider theme={{ color: 'ink' }}>
          <header className={cx(styles.header, `theme--ink`)}>
            <div className={styles.headerSection}>
              <IconButton
                ref={cancelButtonRef}
                disabled={isFormSubmitting}
                onClick={() => onCancel()}
                title="Cancel">
                <Close />
              </IconButton>
              <h1 className={styles.editTitle}>Editing museum</h1>
            </div>

            <div className={styles.headerSection}>
              <AutofitTextField
                id="gallery-name"
                inputClassName={cx(styles.title)}
                label="Gallery name"
                placeholder="Name"
                disabled={isFormSubmitting}
                value={name}
                onChange={name => setName(name)}
              />
            </div>

            <div className={styles.headerSection}>
              <Tooltip
                value={<KeyboardShortcut keys={['meta', 's']} />}
                disabled={isFormSubmitting}>
                <Button disabled={isFormSubmitting} onClick={() => onSave()}>
                  Save
                </Button>
              </Tooltip>
            </div>
          </header>
        </ThemeProvider>
      )}

      <ClientOnly>
        <MuseumMap
          disabled={isFormSubmitting}
          galleries={galleries}
          isEditing={canEdit && isEditing}
          onGalleryCreate={position => {
            setGalleries([
              ...galleries,
              {
                museumId: museum.id,
                name: 'New Gallery',
                color: 'paper',
                height: 40,
                position,
                artworks: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]);
          }}
          onGalleryUpdate={(position, updatedGallery) => {
            setGalleries(
              galleries.map(gallery => {
                if (gallery.position.x === position.x && gallery.position.y === position.y) {
                  return updatedGallery;
                }
                return gallery;
              }),
            );
          }}
          onGalleryDelete={position => {
            setGalleries(
              galleries.filter(
                gallery =>
                  !(gallery.position.x === position.x && gallery.position.y === position.y),
              ),
            );
          }}
        />
      </ClientOnly>
    </Fragment>
  );
};

MuseumMapView.layout = MuseumLayout;
MuseumMapView.getPageLayoutProps = pageProps => ({
  museum: pageProps.museum,
});
MuseumMapView.getGlobalLayoutProps = pageProps => ({
  navOverrides: {
    left: (
      <Link passHref href={`/museum/${pageProps.museum.id}/about`}>
        <a>About</a>
      </Link>
    ),
    right: <ViewToggle />,
  },
});

export default MuseumMapView;

export const getServerSideProps: GetServerSideProps<
  MuseumMapViewProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    const galleries = await GalleryRepository.findAllByMuseum(museum.id);

    return {
      props: {
        museum: MuseumSerializer.serialize(museum),
        galleries: galleries.map(gallery => GallerySerializer.serialize(gallery)),
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
