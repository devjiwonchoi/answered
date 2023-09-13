export const query = `
query {

  viewer {

    login

    repositoryDiscussionComments(onlyAnswers: true, first:100) {

      totalCount

      nodes {

        url

      }

    }

  }

}`
