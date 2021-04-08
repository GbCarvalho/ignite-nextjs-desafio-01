import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="background" />
        <div className={styles.post}>
          <header>
            <h1>{post.data.title}</h1>
            <span>
              <time>
                <FiCalendar size={20} />
                {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
                  locale: ptBR,
                })}
              </time>
              <p>
                <FiUser size={20} />
                {post.data.author}
              </p>
              <time>
                <FiClock size={20} />
                {`${Math.ceil(
                  post.data.content.reduce((totalCharacters, postContent) => {
                    const characters = RichText.asText(postContent.body).split(
                      ' '
                    ).length;

                    totalCharacters += characters;

                    return totalCharacters;
                  }, 0) / 200
                )} min`}
              </time>
            </span>
            {post.first_publication_date !== post.last_publication_date && (
              <div className={styles.edittedAt}>
                <time>
                  * editado em{' '}
                  {format(new Date(post.last_publication_date), 'dd LLL yyyy', {
                    locale: ptBR,
                  })}{' '}
                  às{' '}
                  {format(new Date(post.last_publication_date), 'HH:mm', {
                    locale: ptBR,
                  })}
                </time>
              </div>
            )}
          </header>

          <div>
            {post.data.content.map(part => (
              <div key={part.heading}>
                <h1>{part.heading}</h1>

                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(part.body),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title'],
      pageSize: 20,
    }
  );

  return {
    paths: [
      { params: { slug: 'como-utilizar-hooks' } },
      { params: { slug: 'criando-um-app-cra-do-zero' } },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
