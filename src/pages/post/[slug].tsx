import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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

export default function Post({ post }: PostProps) {
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
                <FiClock size={20} />4 min
              </time>
            </span>
          </header>

          <body>
            {post.data.content.map(part => (
              <>
                <h1>{part.heading}</h1>

                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(part.body),
                  }}
                />
              </>
            ))}
          </body>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  //   // TODO

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

//   // TODO
// };
