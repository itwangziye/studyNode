import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { ElasticsearchService } from "../elasticsearch/elasticsearch.service"

interface SearchableArticle {
    id: number,
    title: string,
    content: string,
    authorId: number
  // 填：id / title / content / authorId 四个字段及类型
}

@Injectable()
export class ArticleSearchService implements OnApplicationBootstrap {
  // index 名字常量,业务代码统一用这个,避免拼写不一致
  private readonly indexName = "articles"
  private readonly logger = new Logger(ArticleSearchService.name)

  constructor(private readonly es: ElasticsearchService) {}

  async onApplicationBootstrap() {
    try {
        await this.ensureIndex()
    } catch (error) {
        this.logger.error("ArticleSearchService 初始化失败")
    }
  }

  // 建 index(应用启动时调一次)
  async ensureIndex() {
    const exists = await this.es.client.indices.exists({
      index: this.indexName,
    })
    if (exists) return  // 已存在就不重建

    await this.es.client.indices.create({
      index: this.indexName,
      mappings: {
        properties: {
            title: {type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart"},
            content: {type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart"},
            authorId: {type: "integer"}
        },
      },
    })
  }

    async indexArticle(article: SearchableArticle) {
        await this.es.client.index({
            index: this.indexName,
            id: String(article.id),  // ← 用 MySQL 的 id 作为 ES _id
            document: {
                title: article.title,
                content: article.content,
                authorId: article.authorId
            },
        })
    }
    
    async search(keyword: string) {
        const result = await this.es.client.search({
            index: this.indexName,
            query: {
                multi_match: {
                    query: keyword,
                    fields: ["title", "content"],  // 同时搜标题和正文
                },
            },
        })
        return result.hits.hits.map(item => {
            return {
                ...item._source as any,
                score: item._score,
            }
        })
    }
}