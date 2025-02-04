import ReactMarkdown from 'react-markdown';

const rulesMarkdown = `
## What is it?
A zephyr hosted competition with multiple categories. The idea is explore usage of our platform and to get people to ship things. Everyone will compete across categories and the Zephyr team will pick 3 winners across 4 categories which will win cash prizes. The Community will pick one winner per category based on up votes. For inspiration on what is possible, take a peek at our [__blog__](https://zephyr-cloud.io/blog), our [__Examples repo__](https://github.com/ZephyrCloudIO/zephyr-examples) for web or our [__mobile examples repo__](https://github.com/ZephyrCloudIO/zephyr-repack-example) and don't forget to follow us on our [X](https://x.com/ZephyrCloudIO) account where we have shared multiple tutorials.

* First Place: $500
* Second Place: $100
* Third Place: $25
* Community Choice: $50

## Categories
* Best Mobile App
* Best Lighthouse Score
* Best Gen AI
* Speed Run (fasted deploy)

## Overall Criteria
* Must use Zephyr deployment either on our built in cloud or on the bring your own cloud.
* No purchase necessary to win. Free tier 1 user accounts can be used.
* All submissions must include a pull request and reproduction readme in the Zephyr Contest repo to be eligible.

## Timing
* Submissions must be complete by Friday Feb. 7th at midnight Eastern USA time.
* Community judging must be complete and will be "frozen" manually at Midnight Sunday Feb. 9th Eastern USA time. 
* Winners will be announced Monday Feb. 10th 9am Eastern USA time. 

## Judging
* Zephyr Team Votes account for 50% weight. 
* Community voted Best for each category gets $50 regardless of Zephyr Team Votes

### Best Mobile App 
* Most Creative
* Best use of Modules + Zephyr

### Best Lighthouse Score
* In the event of multiple full 100 scores we will judge based on complexity, size, and ease of use in addition to the lighthouse score.

### Best Gen AI
* Use any AI platform such as: v0, Bolt, OpenAI, DeepSeek
* Most creative / interesting

### Speed Run
* Starting from empty IDE or terminal
* Can use any starting repo, any generator, any creative way to create an application
* Offline npm modules / yarn modules are allowed
* Must submit unedited video as link of the entire speed run
`;

export function Rules() {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-8 text-white" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-white" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-gray-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-gray-300" {...props} />,
          li: ({node, ...props}) => <li className="mb-2" {...props} />,
          p: ({node, ...props}) => <p className="mb-4 text-gray-300" {...props} />,
        }}
      >
        {rulesMarkdown}
      </ReactMarkdown>
    </div>
  );
}