import {expect, test} from '@oclif/test'

describe('scan', () => {
  test
  .stdout()
  .command(['scan'])
  .it('runs scan', ctx => {
    expect(ctx.stdout).to.contain('SCAN STARTED')
  })
})
