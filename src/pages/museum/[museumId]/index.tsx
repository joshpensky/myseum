import { Fragment, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import tw from 'twin.macro';
import { GalleryColor } from '@prisma/client';
import toast from 'react-hot-toast';
import * as z from 'zod';
import AutofitTextField from '@src/components/AutofitTextField';
import Button from '@src/components/Button';
import FloatingActionButton from '@src/components/FloatingActionButton';
import MuseumMap, { CreateUpdateGalleryDto } from '@src/components/MuseumMap';
import Portal from '@src/components/Portal';
import { GalleryRepository } from '@src/data/GalleryRepository';
import { GalleryDto, GallerySerializer } from '@src/data/GallerySerializer';
import { MuseumRepository, UpdateMuseumDto } from '@src/data/MuseumRepository';
import { MuseumDto, MuseumSerializer } from '@src/data/MuseumSerializer';
import { MuseumHomeLayout } from '@src/layouts/museum';
import { useAuth } from '@src/providers/AuthProvider';
import { useMuseum } from '@src/providers/MuseumProvider';
import Edit from '@src/svgs/Edit';

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

const MuseumMapView = (props: MuseumMapViewProps) => {
  const auth = useAuth();

  const { museum, setMuseum } = useMuseum();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(museum.name);
  const [galleries, setGalleries] = useState<CreateUpdateGalleryDto[]>(props.galleries);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const onEdit = () => {
    setName(museum.name);
    setGalleries(props.galleries);
    setIsEditing(true);
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
      setIsEditing(false);
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

  return (
    <Fragment>
      <Head>
        <title>{museum.name} | Myseum</title>
      </Head>

      {!isEditing && auth.user && auth.user.id === museum.curator.id && (
        <div css={tw`fixed bottom-6 right-6 flex flex-col z-fab`}>
          <FloatingActionButton title="Edit museum" onClick={() => onEdit()}>
            <Edit />
          </FloatingActionButton>
        </div>
      )}

      {isEditing && (
        <Portal to="nav" prepend>
          <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
            <p css={tw`uppercase text-xs tracking-widest font-bold text-center my-1`}>Editing</p>
            <div css={tw`flex flex-1`}>
              <div css={tw`flex flex-1 items-center justify-start`}>
                <Button onClick={() => setIsEditing(false)} disabled={isFormSubmitting}>
                  Cancel
                </Button>
              </div>
              <div css={tw`flex flex-1 items-center justify-center`}>
                <AutofitTextField
                  id="museum-name"
                  // css={[tw`pb-0.5`]}
                  // inputCss={[tw`font-serif leading-none text-3xl`]}
                  label="Museum name"
                  disabled={isFormSubmitting}
                  value={name}
                  onChange={setName}
                />
              </div>
              <div css={tw`flex flex-1 items-center justify-end`}>
                <Button onClick={onSave} disabled={isFormSubmitting}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <MuseumMap
        disabled={isFormSubmitting}
        galleries={galleries}
        isEditing={isEditing}
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
              gallery => !(gallery.position.x === position.x && gallery.position.y === position.y),
            ),
          );
        }}
      />
    </Fragment>
  );
};

MuseumMapView.Layout = MuseumHomeLayout;

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
