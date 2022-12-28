window = JS.global[:window]

tmp = "/home/me/tmp"
output = "#{tmp}/output"

FileUtils.mkdir_p(tmp)

File.write("#{tmp}/main.rb", window[:mainRb].to_s)
File.write("#{tmp}/.rubocop.yml", window[:rubocopYml].to_s)

options = {
  cache: 'false',
  formatters: [['json', output]],
}
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = 0
begin
  runner.run([tmp])
rescue Errno::ENOENT
  # FIXME: Fails unexpectedly the first few times
  if retried < 5
    retried += 1
    retry
  end
  raise
end

File.read(output)
