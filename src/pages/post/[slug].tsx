import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { useEffect } from 'react';
import Link from 'next/link';
import { stringify } from 'node:querystring';
import Header from '../../components/Header';

import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';

interface SubsequentPosts {
  uid: string;
  data: {
    title: string;
  };
}

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
  nextPost?: SubsequentPosts;
  prevPost: SubsequentPosts;
}

export default function Post({
  post,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('comments');

    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute(
      'repo',
      'GbCarvalho/utterances-comments-spacetravelling-web'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'photon-dark');

    if (anchor && script) {
      anchor.appendChild(script);
    }
  }, [router.isFallback]);

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

          <footer id="comments" className={styles.footer}>
            <div>
              {prevPost && (
                <Link href={`/post/${prevPost.uid}`}>
                  <a>
                    <abbr>{prevPost.data.title}</abbr>
                    <p>Post anterior</p>
                  </a>
                </Link>
              )}
              {nextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                  <a>
                    <abbr>{nextPost.data.title}</abbr>
                    <p>Próximo post</p>
                  </a>
                </Link>
              )}
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
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

  const prevPost = (
    await prismic.query(
      Prismic.predicates.dateBefore(
        'document.first_publication_date',
        response.first_publication_date
      ),
      {
        pageSize: 1,
        fetch: 'posts.title',
      }
    )
  ).results[0];

  const nextPost = (
    await prismic.query([Prismic.Predicates.at('document.type', 'posts')], {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  if (prevPost?.uid === nextPost?.uid || !nextPost) {
    return {
      props: {
        post: response,
        prevPost,
      },
    };
  }

  return {
    props: {
      post: response,
      nextPost,
      prevPost,
    },
  };
};
