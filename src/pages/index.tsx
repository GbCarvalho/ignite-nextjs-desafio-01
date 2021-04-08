import Link from 'next/link';
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);

  async function fetchPosts(receivedNextPage: string): Promise<void> {
    fetch(receivedNextPage)
      .then(response => response.json())
      .then(data => {
        setPosts([...posts, ...data.results]);
        setNextPage(data.next_page);
      });
  }

  useEffect(() => {
    setPosts([...postsPagination.results]);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  return (
    <>
      <header className={styles.header}>
        <img src="/images/logo.svg" alt="logo" />
      </header>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>

                <p>{post.data.subtitle}</p>
                <span>
                  <time>
                    <FiCalendar size={20} />
                    {format(
                      new Date(post.first_publication_date),
                      'dd LLL yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                  <p>
                    <FiUser size={20} />
                    {post.data.author}
                  </p>
                </span>
              </a>
            </Link>
          ))}

          <footer>
            {nextPage ? (
              <button
                className={styles.loadMore}
                type="button"
                onClick={() => fetchPosts(postsPagination.next_page)}
              >
                Carregar mais posts
              </button>
            ) : (
              ''
            )}

            {preview && (
              <aside>
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
          </footer>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
      preview,
    },
    revalidate: 60 * 60 * 10, // 10 minutes
  };
};
